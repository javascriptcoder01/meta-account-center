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
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CATEGORIES
} from '../constants/activityTypes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      'User profile not found',
      ERROR_CODES.NOT_FOUND
    );
  }

  if (user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(
      403,
      'Your account is inactive or suspended',
      ERROR_CODES.FORBIDDEN
    );
  }

  return sanitizeUser(user);
};

export const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(
      403,
      'Your account is inactive or suspended',
      ERROR_CODES.FORBIDDEN
    );
  }

  const updates = {};
  const changedFields = [];

  if (
    updateData.firstName !== undefined &&
    updateData.firstName !== user.name.firstName
  ) {
    updates['name.firstName'] = updateData.firstName;
    changedFields.push('firstName');
  }

  if (
    updateData.lastName !== undefined &&
    updateData.lastName !== user.name.lastName
  ) {
    updates['name.lastName'] = updateData.lastName;
    changedFields.push('lastName');
  }

  if (updateData.dateOfBirth !== undefined) {
    const newDob = new Date(updateData.dateOfBirth).toISOString();

    const oldDob = user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString()
      : null;

    if (newDob !== oldDob) {
      updates.dateOfBirth = updateData.dateOfBirth;
      changedFields.push('dateOfBirth');
    }
  }

  if (
    updateData.profilePicture !== undefined &&
    updateData.profilePicture !== user.profilePicture
  ) {
    updates.profilePicture = updateData.profilePicture;
    changedFields.push('profilePicture');
  }

  if (changedFields.length === 0) {
    return sanitizeUser(user);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    {
      new: true,
      runValidators: true
    }
  );

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.PROFILE_UPDATED,
    category: ACTIVITY_CATEGORIES.PROFILE,
    description: 'Profile updated successfully',
    metadata: {
      changedFields
    }
  });

  return sanitizeUser(updatedUser);
};

export const changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(userId);

  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(
      403,
      'Your account is inactive or suspended',
      ERROR_CODES.FORBIDDEN
    );
  }

  const currentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!currentPasswordValid) {
    throw new ApiError(
      401,
      'Current password is incorrect.',
      ERROR_CODES.UNAUTHORIZED
    );
  }

  const samePassword = await bcrypt.compare(
    newPassword,
    user.passwordHash
  );

  if (samePassword) {
    throw new ApiError(
      400,
      'New password must be different from your current password.',
      ERROR_CODES.BAD_REQUEST
    );
  }

  const newPasswordHash = await bcrypt.hash(
    newPassword,
    config.bcryptSaltRounds
  );

  const now = new Date();

  const mongooseSession = await mongoose.startSession();

  try {
    mongooseSession.startTransaction();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          passwordHash: newPasswordHash
        }
      },
      {
        session: mongooseSession,
        new: true,
        runValidators: false
      }
    );

    if (!updatedUser) {
      throw new ApiError(
        404,
        'User profile not found',
        ERROR_CODES.NOT_FOUND
      );
    }

    await SecuritySettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          lastPasswordChangedAt: now
        }
      },
      {
        session: mongooseSession,
        new: true
      }
    );

    await UserSession.updateMany(
      {
        userId,
        isActive: true
      },
      {
        $set: {
          isActive: false,
          revokedAt: now
        }
      },
      {
        session: mongooseSession
      }
    );

    await ActivityLog.create(
      [
        {
          userId,
          action: ACTIVITY_ACTIONS.PASSWORD_CHANGED,
          category: ACTIVITY_CATEGORIES.SECURITY,
          description:
            'Password changed successfully from profile settings'
        }
      ],
      {
        session: mongooseSession
      }
    );

    await mongooseSession.commitTransaction();

    return {
      success: true,
      message: 'Password changed successfully'
    };

  } catch (error) {

    if (mongooseSession.inTransaction()) {
      await mongooseSession.abortTransaction();
    }

    const errorMessage = error?.message || '';

    const isTransactionUnsupported =
      errorMessage.toLowerCase().includes('transaction') ||
      error?.code === 20;

    if (isTransactionUnsupported) {
      logger.warn(
        'MongoDB transactions are unsupported in this environment. ' +
        'Falling back to compensated sequential writes for Change Password.'
      );

      return await changePasswordSequentialFallback(
        userId,
        user.passwordHash,
        newPasswordHash
      );
    }

    throw error;

  } finally {
    await mongooseSession.endSession();
  }
};

const changePasswordSequentialFallback = async (
  userId,
  oldPasswordHash,
  newPasswordHash
) => {

  let userUpdated = false;
  let securityUpdated = false;
  let sessionsUpdated = false;

  let previousSecurityTimestamp = null;
  let previousSessions = [];

  const now = new Date();

  try {

    const securitySettings = await SecuritySettings.findOne({
      userId
    });

    if (securitySettings) {
      previousSecurityTimestamp =
        securitySettings.lastPasswordChangedAt;
    }

    previousSessions = await UserSession.find({
      userId,
      isActive: true
    }).lean();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          passwordHash: newPasswordHash
        }
      },
      {
        new: true,
        runValidators: false
      }
    );

    if (!updatedUser) {
      throw new ApiError(
        404,
        'User profile not found',
        ERROR_CODES.NOT_FOUND
      );
    }

    userUpdated = true;

    if (securitySettings) {
      await SecuritySettings.findOneAndUpdate(
        { userId },
        {
          $set: {
            lastPasswordChangedAt: now
          }
        }
      );

      securityUpdated = true;
    }

    await UserSession.updateMany(
      {
        userId,
        isActive: true
      },
      {
        $set: {
          isActive: false,
          revokedAt: now
        }
      }
    );

    sessionsUpdated = true;

    await ActivityLog.create({
      userId,
      action: ACTIVITY_ACTIONS.PASSWORD_CHANGED,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description:
        'Password changed successfully from profile settings (fallback)'
    });

    return {
      success: true,
      message: 'Password changed successfully'
    };

  } catch (error) {

    logger.error(
      { err: error },
      'Error during sequential password change; commencing rollback compensation'
    );

    try {

      if (userUpdated) {
        await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              passwordHash: oldPasswordHash
            }
          }
        );
      }

      if (securityUpdated) {

        await SecuritySettings.findOneAndUpdate(
          { userId },
          {
            $set: {
              lastPasswordChangedAt:
                previousSecurityTimestamp
            }
          }
        );
      }

      if (sessionsUpdated && previousSessions.length > 0) {

        for (const previousSession of previousSessions) {

          await UserSession.findByIdAndUpdate(
            previousSession._id,
            {
              $set: {
                isActive: previousSession.isActive,
                revokedAt: previousSession.revokedAt
              }
            }
          );

        }
      }

    } catch (rollbackError) {

      logger.fatal(
        { err: rollbackError },
        'CRITICAL ERROR: Change Password sequential compensation rollback failed.'
      );
    }

    throw new ApiError(
      500,
      'Password change failed due to database execution error',
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

export const changeEmail = async (
  userId,
  newEmail
) => {

  const user = await User.findById(userId);

  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(
      403,
      'Your account is inactive or suspended',
      ERROR_CODES.FORBIDDEN
    );
  }

  const normalizedEmail = newEmail.toLowerCase();

  if (normalizedEmail === user.email) {
    throw new ApiError(
      400,
      'New email address must be different from current email',
      ERROR_CODES.BAD_REQUEST
    );
  }

  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    throw new ApiError(
      409,
      'An account with this email already exists.',
      ERROR_CODES.CONFLICT
    );
  }

  const mongooseSession = await mongoose.startSession();

  try {

    mongooseSession.startTransaction();

    const now = new Date();

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          email: normalizedEmail,
          emailVerified: false
        }
      },
      {
        session: mongooseSession
      }
    );

    await UserSession.updateMany(
      {
        userId,
        isActive: true
      },
      {
        $set: {
          isActive: false,
          revokedAt: now
        }
      },
      {
        session: mongooseSession
      }
    );

    await ActivityLog.create(
      [
        {
          userId,
          action: ACTIVITY_ACTIONS.EMAIL_CHANGED,
          category: ACTIVITY_CATEGORIES.SECURITY,
          description:
            `Email updated from ${user.email} to ${normalizedEmail}`
        }
      ],
      {
        session: mongooseSession
      }
    );

    await mongooseSession.commitTransaction();

  } catch (error) {

    if (mongooseSession.inTransaction()) {
      await mongooseSession.abortTransaction();
    }

    const errorMessage = error?.message || '';

    const isTransactionUnsupported =
      errorMessage.toLowerCase().includes('transaction') ||
      error?.code === 20;

    if (isTransactionUnsupported) {

      logger.warn(
        'MongoDB transactions are unsupported in this environment. ' +
        'Falling back to compensated sequential writes for Change Email.'
      );

      return await changeEmailSequentialFallback(
        userId,
        user.email,
        normalizedEmail
      );
    }

    throw error;

  } finally {
    await mongooseSession.endSession();
  }

  return {
    success: true,
    message: 'Email changed successfully'
  };
};

const changeEmailSequentialFallback = async (
  userId,
  oldEmail,
  newEmail
) => {

  let userUpdated = false;
  let sessionsRevoked = [];

  const now = new Date();

  try {

    const activeSessions = await UserSession.find({
      userId,
      isActive: true
    }).lean();

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          email: newEmail,
          emailVerified: false
        }
      }
    );

    userUpdated = true;

    await UserSession.updateMany(
      {
        userId,
        isActive: true
      },
      {
        $set: {
          isActive: false,
          revokedAt: now
        }
      }
    );

    sessionsRevoked = activeSessions;

    await ActivityLog.create({
      userId,
      action: ACTIVITY_ACTIONS.EMAIL_CHANGED,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description:
        `Email updated from ${oldEmail} to ${newEmail} (fallback)`
    });

    return {
      success: true,
      message: 'Email changed successfully'
    };

  } catch (error) {

    logger.error(
      { err: error },
      'Error during sequential email change; commencing rollback compensation'
    );

    try {

      if (userUpdated) {

        await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              email: oldEmail
            }
          }
        );

      }

      if (sessionsRevoked.length > 0) {

        for (const session of sessionsRevoked) {

          await UserSession.findByIdAndUpdate(
            session._id,
            {
              $set: {
                isActive: session.isActive,
                revokedAt: session.revokedAt
              }
            }
          );

        }

      }

    } catch (rollbackError) {

      logger.fatal(
        { err: rollbackError },
        'CRITICAL ERROR: Change Email sequential compensation rollback failed.'
      );
    }

    throw new ApiError(
      500,
      'Email change failed due to database execution error',
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

export const changePhone = async (
  userId,
  newPhone
) => {

  const user = await User.findById(userId);

  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(
      403,
      'Your account is inactive or suspended',
      ERROR_CODES.FORBIDDEN
    );
  }

  const targetPhone =
    newPhone === null
      ? null
      : newPhone;

  if (targetPhone !== null) {

    if (targetPhone === user.phone) {
      return sanitizeUser(user);
    }

    const existingUser = await User.findOne({
      phone: targetPhone
    });

    if (existingUser) {
      throw new ApiError(
        409,
        'An account with this phone number already exists.',
        ERROR_CODES.CONFLICT
      );
    }

  } else {

    if (user.phone === null) {
      return sanitizeUser(user);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        phone: targetPhone
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.PHONE_CHANGED,
    category: ACTIVITY_CATEGORIES.SECURITY,
    description:
      targetPhone === null
        ? 'Phone number removed'
        : `Phone number changed to ${targetPhone}`
  });

  return sanitizeUser(updatedUser);
};

export const changeProfilePicture = async (
  userId,
  profilePictureUrl
) => {

  const user = await User.findById(userId);

  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(
      403,
      'Your account is inactive or suspended',
      ERROR_CODES.FORBIDDEN
    );
  }

  const targetPicture =
    profilePictureUrl === null
      ? null
      : profilePictureUrl;

  if (targetPicture === user.profilePicture) {
    return sanitizeUser(user);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        profilePicture: targetPicture
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.PROFILE_UPDATED,
    category: ACTIVITY_CATEGORIES.PROFILE,
    description:
      targetPicture === null
        ? 'Profile picture removed'
        : 'Profile picture updated',
    metadata: {
      changedFields: ['profilePicture']
    }
  });

  return sanitizeUser(updatedUser);
};