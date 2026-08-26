import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import logger from '../config/logger.js';
import User from '../models/User.js';
import PrivacySettings from '../models/PrivacySettings.js';
import SecuritySettings from '../models/SecuritySettings.js';
import ActivityLog from '../models/ActivityLog.js';
import UserSession from '../models/UserSession.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { USER_STATUSES } from '../constants/statuses.js';
import { ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: {
      firstName: user.name.firstName,
      lastName: user.name.lastName
    },
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    profilePicture: user.profilePicture,
    role: user.role,
    emailVerified: user.emailVerified,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const registerUser = async (userData) => {
  const { firstName, lastName, email, phone, dateOfBirth, password } = userData;

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, 'An account with these details already exists.', ERROR_CODES.CONFLICT);
  }

  if (phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      throw new ApiError(409, 'An account with these details already exists.', ERROR_CODES.CONFLICT);
    }
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

  const userPayload = {
    name: { firstName, lastName },
    email: email.toLowerCase(),
    phone: phone || null,
    dateOfBirth: dateOfBirth || null,
    passwordHash,
    role: ROLES.USER,
    emailVerified: false,
    status: USER_STATUSES.ACTIVE
  };

  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    const [user] = await User.create([userPayload], { session: mongooseSession });

    await PrivacySettings.create([{
      userId: user._id,
      profileVisibility: 'PUBLIC',
      emailVisibility: 'PRIVATE',
      phoneVisibility: 'PRIVATE',
      personalizedAds: true,
      dataSharing: false
    }], { session: mongooseSession });

    await SecuritySettings.create([{
      userId: user._id,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      lastPasswordChangedAt: null
    }], { session: mongooseSession });

    await ActivityLog.create([{
      userId: user._id,
      action: ACTIVITY_ACTIONS.REGISTER,
      category: ACTIVITY_CATEGORIES.AUTHENTICATION,
      description: 'Account registered successfully'
    }], { session: mongooseSession });

    await mongooseSession.commitTransaction();
    mongooseSession.endSession();

    return sanitizeUser(user);
  } catch (error) {
    await mongooseSession.abortTransaction();
    mongooseSession.endSession();

    const isTransactionUnsupported = error.message.includes('transaction') || error.code === 20;

    if (isTransactionUnsupported) {
      logger.warn('MongoDB Transactions are unsupported in this environment. Falling back to compensated sequential writes.');
      return await registerUserSequentialFallback(userPayload);
    }

    throw error;
  }
};

const registerUserSequentialFallback = async (userPayload) => {
  let createdUser = null;
  let createdPrivacy = null;
  let createdSecurity = null;
  let createdActivity = null;

  try {
    // 1. Create User
    createdUser = await User.create(userPayload);

    // 2. Create Privacy settings
    createdPrivacy = await PrivacySettings.create({
      userId: createdUser._id,
      profileVisibility: 'PUBLIC',
      emailVisibility: 'PRIVATE',
      phoneVisibility: 'PRIVATE',
      personalizedAds: true,
      dataSharing: false
    });

    // 3. Create Security settings
    createdSecurity = await SecuritySettings.create({
      userId: createdUser._id,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      lastPasswordChangedAt: null
    });

    // 4. Create Activity Log
    createdActivity = await ActivityLog.create({
      userId: createdUser._id,
      action: ACTIVITY_ACTIONS.REGISTER,
      category: ACTIVITY_CATEGORIES.AUTHENTICATION,
      description: 'Account registered successfully (sequential fallback)'
    });

    return sanitizeUser(createdUser);
  } catch (err) {
    logger.error({ err }, 'Error during sequential registration; commencing compensation rollback');

    // Compensate / Rollback created items
    try {
      if (createdActivity) await ActivityLog.findByIdAndDelete(createdActivity._id);
      if (createdSecurity) await SecuritySettings.findByIdAndDelete(createdSecurity._id);
      if (createdPrivacy) await PrivacySettings.findByIdAndDelete(createdPrivacy._id);
      if (createdUser) await User.findByIdAndDelete(createdUser._id);
    } catch (rollbackErr) {
      logger.fatal({ err: rollbackErr }, 'CRITICAL ERROR: Sequential registration compensation rollback failed. Database is now in an inconsistent state.');
    }

    throw new ApiError(500, 'Registration failed due to a database write error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const loginUser = async (email, password, clientTelemetry = {}) => {

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.status === USER_STATUSES.INACTIVE || user.status === USER_STATUSES.SUSPENDED) {
    throw new ApiError(401, 'Invalid email or password', ERROR_CODES.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password', ERROR_CODES.UNAUTHORIZED);
  }

  const sessionId = crypto.randomUUID();
  const refreshSecret = crypto.randomBytes(32).toString('hex');
  const rawRefreshToken = `${sessionId}:${refreshSecret}`;
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  const parsedRefreshExpires = parseExpiresIn(config.jwtRefreshExpiresIn);
  const expiresAt = new Date(Date.now() + parsedRefreshExpires);

  const session = await UserSession.create({
    userId: user._id,
    sessionId,
    refreshTokenHash,
    deviceName: clientTelemetry.deviceName || null,
    browser: clientTelemetry.browser || null,
    browserVersion: clientTelemetry.browserVersion || null,
    operatingSystem: clientTelemetry.operatingSystem || null,
    ipAddress: clientTelemetry.ipAddress || null,
    userAgent: clientTelemetry.userAgent || null,
    expiresAt,
    isActive: true,
    revokedAt: null,
  });

  const accessToken = jwt.sign(
    { sub: user._id, role: user.role, sessionId },
    config.jwtAccessSecret,
    { algorithm: 'HS256', expiresIn: config.jwtAccessExpiresIn }
  );

  await ActivityLog.create({
    userId: user._id,
    action: ACTIVITY_ACTIONS.LOGIN,
    category: ACTIVITY_CATEGORIES.AUTHENTICATION,
    description: `Logged in from ${clientTelemetry.browser || 'Unknown Browser'} on ${clientTelemetry.operatingSystem || 'Unknown OS'}`,
    deviceName: clientTelemetry.deviceName,
    browser: clientTelemetry.browser,
    operatingSystem: clientTelemetry.operatingSystem,
    ipAddress: clientTelemetry.ipAddress
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: rawRefreshToken
  };
};

export const rotateRefreshToken = async (rawRefreshToken) => {
  const parts = rawRefreshToken.split(':');
  if (parts.length !== 2) {
    throw new ApiError(401, 'Invalid refresh token format', ERROR_CODES.UNAUTHORIZED);
  }

  const [sessionId, secret] = parts;
  const suppliedHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  const session = await UserSession.findOne({ sessionId });
  if (!session) {
    throw new ApiError(401, 'Invalid or expired session', ERROR_CODES.UNAUTHORIZED);
  }

  if (session.refreshTokenHash !== suppliedHash) {
    logger.warn(`Suspicious activity: Refresh token reuse detected for session: ${sessionId}. Revoking family.`);

    session.isActive = false;
    session.revokedAt = new Date();
    await session.save();

    await ActivityLog.create({
      userId: session.userId,
      action: ACTIVITY_ACTIONS.SESSION_REVOKED,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description: 'Session terminated immediately due to refresh token reuse detection',
      metadata: { sessionId, event: 'TOKEN_REUSE' }
    });

    throw new ApiError(401, 'Session compromised. Please login again.', ERROR_CODES.UNAUTHORIZED);
  }

  const isExpired = session.expiresAt <= new Date();
  if (!session.isActive || session.revokedAt !== null || isExpired) {
    throw new ApiError(401, 'Session is invalid or expired', ERROR_CODES.UNAUTHORIZED);
  }

  const newSecret = crypto.randomBytes(32).toString('hex');
  const newRefreshToken = `${sessionId}:${newSecret}`;
  const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  const parsedRefreshExpires = parseExpiresIn(config.jwtRefreshExpiresIn);
  session.expiresAt = new Date(Date.now() + parsedRefreshExpires);
  session.refreshTokenHash = newRefreshTokenHash;
  session.lastActivityAt = new Date();
  await session.save();

  const user = await User.findById(session.userId);
  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(401, 'User associated with session is no longer active', ERROR_CODES.UNAUTHORIZED);
  }

  const accessToken = jwt.sign(
    { sub: user._id, role: user.role, sessionId },
    config.jwtAccessSecret,
    { algorithm: 'HS256', expiresIn: config.jwtAccessExpiresIn }
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    session: session.sessionId
  };
};

export const logoutUser = async (sessionId, userId) => {
  const now = new Date();
  const session = await UserSession.findOneAndUpdate(
    { sessionId, userId, isActive: true },
    { $set: { isActive: false, revokedAt: now } },
    { new: true }
  );

  if (!session) {
    throw new ApiError(404, 'Active session not found', ERROR_CODES.NOT_FOUND);
  }
  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.LOGOUT,
    category: ACTIVITY_CATEGORIES.AUTHENTICATION,
    description: 'Logged out from current session'
  });
};

export const logoutAllDevices = async (userId) => {
  const now = new Date();
  await UserSession.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false, revokedAt: now } }
  );

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.ALL_SESSIONS_REVOKED,
    category: ACTIVITY_CATEGORIES.AUTHENTICATION,
    description: 'Logged out from all active devices and sessions'
  });
};

// export const forgotPassword = async (email) => {
//   const user = await User.findOne({ email: email.toLowerCase() });

//   const genericResponse = {
//     message: 'If the account exists, a password reset link has been generated.'
//   };

//   if (!user || user.status !== USER_STATUSES.ACTIVE) {
//     return genericResponse;
//   }

//   const rawResetToken = crypto.randomBytes(32).toString('hex');
//   const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

//   const parsedResetExpires = parseExpiresIn(config.passwordResetExpiresIn);
//   const expiresAt = new Date(Date.now() + parsedResetExpires);

//   await PasswordResetToken.updateMany(
//     { userId: user._id, usedAt: null },
//     { $set: { usedAt: new Date() } }
//   );

//   await PasswordResetToken.create({
//     userId: user._id,
//     tokenHash,
//     expiresAt
//   });

//   if (config.env === 'development') {
//     logger.info(`[MOCK RESET URL]: http://localhost:5173/reset-password?token=${rawResetToken}`);
//   }

//   return genericResponse;
// };

// export const resetPassword = async (rawResetToken, newPassword) => {
//   const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

//   const now = new Date();
//   const resetTokenDoc = await PasswordResetToken.findOneAndUpdate(
//     {
//       tokenHash,
//       usedAt: null,
//       expiresAt: { $gt: now }
//     },
//     { $set: { usedAt: now } },
//     { new: true }
//   );

//   if (!resetTokenDoc) {
//     throw new ApiError(400, 'Invalid, expired, or already used reset token', ERROR_CODES.BAD_REQUEST);
//   }

//   const user = await User.findById(resetTokenDoc.userId);
//   if (!user || user.status !== USER_STATUSES.ACTIVE) {
//     throw new ApiError(400, 'User associated with reset token is no longer active', ERROR_CODES.BAD_REQUEST);
//   }

//   const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

//   user.passwordHash = newPasswordHash;
//   await user.save();

//   await SecuritySettings.findOneAndUpdate(
//     { userId: user._id },
//     { $set: { lastPasswordChangedAt: now } },
//     { new: true }
//   );

//   await UserSession.updateMany(
//     { userId: user._id, isActive: true },
//     { $set: { isActive: false, revokedAt: now } }
//   );

//   await ActivityLog.create({
//     userId: user._id,
//     action: ACTIVITY_ACTIONS.PASSWORD_CHANGED,
//     category: ACTIVITY_CATEGORIES.SECURITY,
//     description: 'Password changed successfully via recovery flow'
//   });
// };


export const forgotPassword = async (email) => {
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail
  });

  const genericResponse = {
    message: 'If the account exists, a password reset link has been generated.'
  };

  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    return genericResponse;
  }

  const rawResetToken = crypto
    .randomBytes(32)
    .toString('hex');

  const tokenHash = crypto
    .createHash('sha256')
    .update(rawResetToken)
    .digest('hex');

  const parsedResetExpires = parseExpiresIn(
    config.passwordResetExpiresIn
  );

  const expiresAt = new Date(
    Date.now() + parsedResetExpires
  );

  await PasswordResetToken.updateMany(
    {
      userId: user._id,
      usedAt: null
    },
    {
      $set: {
        usedAt: new Date()
      }
    }
  );

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt
  });

  const resetUrl =
    `${config.frontendUrl || 'http://localhost:5173'}` +
    `/reset-password?token=${rawResetToken}`;

  if (config.env === 'development') {
    logger.info(
      `[MOCK RESET URL]: ${resetUrl}`
    );

    return {
      ...genericResponse,
      resetUrl
    };
  }

  return genericResponse;
};

export const resetPassword = async (rawResetToken, newPassword) => {
  const cleanToken = rawResetToken?.trim();

  if (!cleanToken) {
    throw new ApiError(
      400,
      'Reset token is required',
      ERROR_CODES.BAD_REQUEST
    );
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(cleanToken)
    .digest('hex');

  const now = new Date();

  const resetTokenDoc = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: now }
  });

  if (!resetTokenDoc) {
    throw new ApiError(
      400,
      'Invalid, expired, or already used reset token',
      ERROR_CODES.BAD_REQUEST
    );
  }

  const user = await User.findById(resetTokenDoc.userId);

  if (!user || user.status !== USER_STATUSES.ACTIVE) {
    throw new ApiError(
      400,
      'User associated with reset token is no longer active',
      ERROR_CODES.BAD_REQUEST
    );
  }

  const newPasswordHash = await bcrypt.hash(
    newPassword,
    config.bcryptSaltRounds
  );

  user.passwordHash = newPasswordHash;

  await user.save();

  resetTokenDoc.usedAt = now;

  await resetTokenDoc.save();

  await SecuritySettings.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        lastPasswordChangedAt: now
      }
    },
    {
      new: true
    }
  );

  await UserSession.updateMany(
    {
      userId: user._id,
      isActive: true
    },
    {
      $set: {
        isActive: false,
        revokedAt: now
      }
    }
  );

  await ActivityLog.create({
    userId: user._id,
    action: ACTIVITY_ACTIONS.PASSWORD_CHANGED,
    category: ACTIVITY_CATEGORIES.SECURITY,
    description: 'Password changed successfully via recovery flow'
  });
};

const parseExpiresIn = (expiresIn) => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // default 15m
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return amount * 1000;
    case 'm': return amount * 60 * 1000;
    case 'h': return amount * 60 * 60 * 1000;
    case 'd': return amount * 24 * 60 * 60 * 1000;
    default: return amount * 60 * 1000;
  }
};
