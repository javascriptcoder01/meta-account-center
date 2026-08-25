import mongoose from 'mongoose';
import UserSession from '../models/UserSession.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import { ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const sanitizeDevice = (session) => {
  return {
    id: session._id,
    sessionId: session.sessionId,
    deviceName: session.deviceName,
    browser: session.browser,
    browserVersion: session.browserVersion,
    operatingSystem: session.operatingSystem,
    ipAddress: session.ipAddress,
    loginAt: session.loginAt,
    lastActivityAt: session.lastActivityAt
  };
};

export const getActiveDevices = async (userId) => {
  const activeSessions = await UserSession.find({
    userId,
    isActive: true,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  })
    .sort({ lastActivityAt: -1 })
    .lean();

  return activeSessions.map(sanitizeDevice);
};

export const revokeDeviceSession = async (userId, sessionId) => {
  const session = await UserSession.findOne({
    sessionId,
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    throw new ApiError(404, 'Active device session not found or already revoked', ERROR_CODES.NOT_FOUND);
  }

  const now = new Date();
  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    await UserSession.updateOne(
      { sessionId, userId },
      { $set: { isActive: false, revokedAt: now } },
      { session: mongooseSession }
    );

    await ActivityLog.create(
      [
        {
          userId,
          action: ACTIVITY_ACTIONS.SESSION_REVOKED,
          category: ACTIVITY_CATEGORIES.SESSION,
          description: `Device session revoked: ${session.deviceName || 'Unknown Device'} (${session.browser || 'Unknown Browser'})`,
          metadata: { sessionId }
        }
      ],
      { session: mongooseSession }
    );

    await mongooseSession.commitTransaction();
    mongooseSession.endSession();

    return true;
  } catch (error) {
    await mongooseSession.abortTransaction();
    mongooseSession.endSession();

    const isTransactionUnsupported = error.message.includes('transaction') || error.code === 20;

    if (isTransactionUnsupported) {
      logger.warn('MongoDB Transactions are unsupported in this environment. Falling back to compensated sequential writes for Device Management.');
      return await revokeDeviceSessionSequentialFallback(userId, session, sessionId);
    }

    throw error;
  }
};

const revokeDeviceSessionSequentialFallback = async (userId, oldSession, sessionId) => {
  let updated = false;
  const now = new Date();

  try {
    await UserSession.updateOne(
      { sessionId, userId },
      { $set: { isActive: false, revokedAt: now } }
    );
    updated = true;

    await ActivityLog.create({
      userId,
      action: ACTIVITY_ACTIONS.SESSION_REVOKED,
      category: ACTIVITY_CATEGORIES.SESSION,
      description: `Device session revoked (fallback): ${oldSession.deviceName || 'Unknown Device'}`,
      metadata: { sessionId }
    });

    return true;
  } catch (err) {
    logger.error({ err }, 'Error during sequential device session revocation; commencing rollback compensation');

    if (updated) {
      try {
        await UserSession.updateOne(
          { sessionId, userId },
          { $set: { isActive: true }, $unset: { revokedAt: "" } }
        );
      } catch (rollbackErr) {
        logger.fatal({ err: rollbackErr }, 'CRITICAL ERROR: Device session revocation sequential compensation rollback failed.');
      }
    }

    throw new ApiError(500, 'Device session revocation failed due to database execution error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};
