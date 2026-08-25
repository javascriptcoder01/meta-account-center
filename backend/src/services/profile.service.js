import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config/env.js';
import logger from '../config/logger.js';
import User from '../models/User.js';
import SecuritySettings from '../models/SecuritySettings.js';
import UserSession from '../models/UserSession.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import { sanitizeUser } from './auth.service.js';
import { USER_STATUSES } from '../constants/statuses.js';
import { ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found', ERROR_CODES.NOT_FOUND);
  }

  if (user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(403, 'Your account is inactive or suspended', ERROR_CODES.FORBIDDEN);
  }

  return sanitizeUser(user);
};

export const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(403, 'Your account is inactive or suspended', ERROR_CODES.FORBIDDEN);
  }

  const updates = {};
  const changedFields = [];

  if (updateData.firstName !== undefined && updateData.firstName !== user.name.firstName) {
    updates['name.firstName'] = updateData.firstName;
    changedFields.push('firstName');
  }
  if (updateData.lastName !== undefined && updateData.lastName !== user.name.lastName) {
    updates['name.lastName'] = updateData.lastName;
    changedFields.push('lastName');
  }
  if (updateData.dateOfBirth !== undefined) {
    const newDob = new Date(updateData.dateOfBirth).toISOString();
    const oldDob = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString() : null;
    if (newDob !== oldDob) {
      updates.dateOfBirth = updateData.dateOfBirth;
      changedFields.push('dateOfBirth');
    }
  }
  if (updateData.profilePicture !== undefined && updateData.profilePicture !== user.profilePicture) {
    updates.profilePicture = updateData.profilePicture;
    changedFields.push('profilePicture');
  }

  if (changedFields.length === 0) {
    return sanitizeUser(user);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.PROFILE_UPDATED,
    category: ACTIVITY_CATEGORIES.PROFILE,
    description: 'Profile updated successfully',
    metadata: { changedFields }
  });

  return sanitizeUser(updatedUser);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(403, 'Your account is inactive or suspended', ERROR_CODES.FORBIDDEN);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect.', ERROR_CODES.UNAUTHORIZED);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    const now = new Date();

    await User.findByIdAndUpdate(userId, { $set: { passwordHash: newPasswordHash } }, { session: mongooseSession });

    await SecuritySettings.findOneAndUpdate(
      { userId },
      { $set: { lastPasswordChangedAt: now } },
      { session: mongooseSession }
    );

    await UserSession.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, revokedAt: now } },
      { session: mongooseSession }
    );

    await ActivityLog.create([{
      userId,
      action: ACTIVITY_ACTIONS.PASSWORD_CHANGED,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description: 'Password changed successfully from profile settings'
    }], { session: mongooseSession });

    await mongooseSession.commitTransaction();
    mongooseSession.endSession();
  } catch (error) {
    await mongooseSession.abortTransaction();
    mongooseSession.endSession();

    const isTransactionUnsupported = error.message.includes('transaction') || error.code === 20;

    if (isTransactionUnsupported) {
      logger.warn('MongoDB Transactions are unsupported in this environment. Falling back to compensated sequential writes for Change Password.');
      return await changePasswordSequentialFallback(userId, user.passwordHash, newPasswordHash);
    }

    throw error;
  }
};

const changePasswordSequentialFallback = async (userId, oldPasswordHash, newPasswordHash) => {
  let userUpdated = false;
  let securityUpdated = false;
  let sessionsRevoked = [];

  const now = new Date();

  try {
    const activeSessions = await UserSession.find({ userId, isActive: true });

    await User.findByIdAndUpdate(userId, { $set: { passwordHash: newPasswordHash } });
    userUpdated = true;

    await SecuritySettings.findOneAndUpdate({ userId }, { $set: { lastPasswordChangedAt: now } });
    securityUpdated = true;

    await UserSession.updateMany({ userId, isActive: true }, { $set: { isActive: false, revokedAt: now } });
    sessionsRevoked = activeSessions.map(s => s._id);

    await ActivityLog.create({
      userId,
      action: ACTIVITY_ACTIONS.PASSWORD_CHANGED,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description: 'Password changed successfully from profile settings (fallback)'
    });

  } catch (err) {
    logger.error({ err }, 'Error during sequential password change; commencing rollback compensation');

    try {
      if (userUpdated) {
        await User.findByIdAndUpdate(userId, { $set: { passwordHash: oldPasswordHash } });
      }
      if (securityUpdated) {
        await SecuritySettings.findOneAndUpdate({ userId }, { $set: { lastPasswordChangedAt: null } });
      }
      if (sessionsRevoked.length > 0) {
        await UserSession.updateMany(
          { _id: { $in: sessionsRevoked } },
          { $set: { isActive: true }, $unset: { revokedAt: "" } }
        );
      }
    } catch (rollbackErr) {
      logger.fatal({ err: rollbackErr }, 'CRITICAL ERROR: Change Password sequential compensation rollback failed.');
    }

    throw new ApiError(500, 'Password change failed due to database execution error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const changeEmail = async (userId, newEmail) => {
  const user = await User.findById(userId);
  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(403, 'Your account is inactive or suspended', ERROR_CODES.FORBIDDEN);
  }

  const normalizedEmail = newEmail.toLowerCase();
  if (normalizedEmail === user.email) {
    throw new ApiError(400, 'New email address must be different from current email', ERROR_CODES.BAD_REQUEST);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.', ERROR_CODES.CONFLICT);
  }

  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    const now = new Date();

    await User.findByIdAndUpdate(
      userId,
      { $set: { email: normalizedEmail, emailVerified: false } },
      { session: mongooseSession }
    );

    await UserSession.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, revokedAt: now } },
      { session: mongooseSession }
    );

    await ActivityLog.create([{
      userId,
      action: ACTIVITY_ACTIONS.EMAIL_CHANGED,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description: `Email updated from ${user.email} to ${normalizedEmail}`
    }], { session: mongooseSession });

    await mongooseSession.commitTransaction();
    mongooseSession.endSession();
  } catch (error) {
    await mongooseSession.abortTransaction();
    mongooseSession.endSession();

    const isTransactionUnsupported = error.message.includes('transaction') || error.code === 20;

    if (isTransactionUnsupported) {
      logger.warn('MongoDB Transactions are unsupported in this environment. Falling back to compensated sequential writes for Change Email.');
      return await changeEmailSequentialFallback(userId, user.email, normalizedEmail);
    }

    throw error;
  }
};

const changeEmailSequentialFallback = async (userId, oldEmail, newEmail) => {
  let userUpdated = false;
  let sessionsRevoked = [];

  const now = new Date();

  try {
    const activeSessions = await UserSession.find({ userId, isActive: true });

    await User.findByIdAndUpdate(userId, { $set: { email: newEmail, emailVerified: false } });
    userUpdated = true;

    await UserSession.updateMany({ userId, isActive: true }, { $set: { isActive: false, revokedAt: now } });
    sessionsRevoked = activeSessions.map(s => s._id);

    await ActivityLog.create({
      userId,
      action: ACTIVITY_ACTIONS.EMAIL_CHANGED,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description: `Email updated from ${oldEmail} to ${newEmail} (fallback)`
    });

  } catch (err) {
    logger.error({ err }, 'Error during sequential email change; commencing rollback compensation');

    try {
      if (userUpdated) {
        await User.findByIdAndUpdate(userId, { $set: { email: oldEmail, emailVerified: true } });
      }
      if (sessionsRevoked.length > 0) {
        await UserSession.updateMany(
          { _id: { $in: sessionsRevoked } },
          { $set: { isActive: true }, $unset: { revokedAt: "" } }
        );
      }
    } catch (rollbackErr) {
      logger.fatal({ err: rollbackErr }, 'CRITICAL ERROR: Change Email sequential compensation rollback failed.');
    }

    throw new ApiError(500, 'Email change failed due to database execution error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const changePhone = async (userId, newPhone) => {
  const user = await User.findById(userId);
  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(403, 'Your account is inactive or suspended', ERROR_CODES.FORBIDDEN);
  }

  const targetPhone = newPhone === null ? null : newPhone;

  if (targetPhone !== null) {
    if (targetPhone === user.phone) {
      return sanitizeUser(user);
    }

    const existingUser = await User.findOne({ phone: targetPhone });
    if (existingUser) {
      throw new ApiError(409, 'An account with this phone number already exists.', ERROR_CODES.CONFLICT);
    }
  } else {
    if (user.phone === null) {
      return sanitizeUser(user);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { phone: targetPhone } },
    { new: true, runValidators: true }
  );

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.PHONE_CHANGED,
    category: ACTIVITY_CATEGORIES.SECURITY,
    description: targetPhone === null ? 'Phone number removed' : `Phone number changed to ${targetPhone}`
  });

  return sanitizeUser(updatedUser);
};


export const changeProfilePicture = async (userId, profilePictureUrl) => {
  const user = await User.findById(userId);
  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(403, 'Your account is inactive or suspended', ERROR_CODES.FORBIDDEN);
  }

  const targetPicture = profilePictureUrl === null ? null : profilePictureUrl;

  if (targetPicture === user.profilePicture) {
    return sanitizeUser(user);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { profilePicture: targetPicture } },
    { new: true, runValidators: true }
  );

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.PROFILE_UPDATED,
    category: ACTIVITY_CATEGORIES.PROFILE,
    description: targetPicture === null ? 'Profile picture removed' : 'Profile picture updated',
    metadata: { changedFields: ['profilePicture'] }
  });

  return sanitizeUser(updatedUser);
};
