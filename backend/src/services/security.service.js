import mongoose from 'mongoose';
import SecuritySettings from '../models/SecuritySettings.js';
import UserSession from '../models/UserSession.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import { ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const sanitizeSecurity = (settings) => {
  return {
    twoFactorEnabled: settings.twoFactorEnabled,
    twoFactorMethod: settings.twoFactorMethod,
    lastPasswordChangedAt: settings.lastPasswordChangedAt,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt
  };
};

export const getSecuritySettings = async (userId) => {
  let settings = await SecuritySettings.findOne({ userId });

  if (!settings) {
    try {
      settings = await SecuritySettings.create({
        userId,
        twoFactorEnabled: false,
        twoFactorMethod: null,
        lastPasswordChangedAt: null
      });
    } catch (error) {
      if (error.code === 11000) {
        settings = await SecuritySettings.findOne({ userId });
      } else {
        throw error;
      }
    }
  }

  return settings;
};

export const updateSecuritySettings = async (userId, updateData) => {
  const settings = await getSecuritySettings(userId);

  const updates = {};
  const changedFields = [];

  const finalEnabled = updateData.twoFactorEnabled !== undefined ? updateData.twoFactorEnabled : settings.twoFactorEnabled;
  const finalMethod = updateData.twoFactorMethod !== undefined ? updateData.twoFactorMethod : settings.twoFactorMethod;

  if (finalEnabled === false && finalMethod !== null) {
    throw new ApiError(400, 'twoFactorMethod must be null when twoFactorEnabled is false', ERROR_CODES.BAD_REQUEST);
  }
  if (finalEnabled === true && (finalMethod === null || !['SMS', 'AUTHENTICATOR_APP', 'EMAIL'].includes(finalMethod))) {
    throw new ApiError(400, 'twoFactorMethod must be SMS, AUTHENTICATOR_APP, or EMAIL when twoFactorEnabled is true', ERROR_CODES.BAD_REQUEST);
  }

  if (updateData.twoFactorEnabled !== undefined && updateData.twoFactorEnabled !== settings.twoFactorEnabled) {
    updates.twoFactorEnabled = updateData.twoFactorEnabled;
    changedFields.push('twoFactorEnabled');
  }
  if (updateData.twoFactorMethod !== undefined && updateData.twoFactorMethod !== settings.twoFactorMethod) {
    updates.twoFactorMethod = updateData.twoFactorMethod;
    changedFields.push('twoFactorMethod');
  }

  if (changedFields.length === 0) {
    return { security: sanitizeSecurity(settings), sessionsRevoked: false };
  }


  let activityAction = ACTIVITY_ACTIONS.TWO_FACTOR_ENABLED;
  if (finalEnabled === false) {
    activityAction = ACTIVITY_ACTIONS.TWO_FACTOR_DISABLED;
  }

  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    const now = new Date();

    const updatedSettings = await SecuritySettings.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: true, session: mongooseSession }
    );

    await UserSession.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, revokedAt: now } },
      { session: mongooseSession }
    );

    await ActivityLog.create([{
      userId,
      action: activityAction,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description: finalEnabled ? `2FA enabled using ${finalMethod}` : '2FA disabled successfully'
    }], { session: mongooseSession });

    await mongooseSession.commitTransaction();
    mongooseSession.endSession();

    return { security: sanitizeSecurity(updatedSettings), sessionsRevoked: true };
  } catch (error) {
    await mongooseSession.abortTransaction();
    mongooseSession.endSession();

    const isTransactionUnsupported = error.message.includes('transaction') || error.code === 20;

    if (isTransactionUnsupported) {
      logger.warn('MongoDB Transactions are unsupported in this environment. Falling back to compensated sequential writes for Security settings.');
      return await updateSecuritySequentialFallback(userId, updates, settings, activityAction);
    }

    throw error;
  }
};

const updateSecuritySequentialFallback = async (userId, updates, oldSettings, activityAction) => {
  let settingsUpdated = false;
  let sessionsRevoked = [];

  const now = new Date();

  try {
    const activeSessions = await UserSession.find({ userId, isActive: true });

    const updatedSettings = await SecuritySettings.findOneAndUpdate({ userId }, { $set: updates }, { new: true });
    settingsUpdated = true;

    await UserSession.updateMany({ userId, isActive: true }, { $set: { isActive: false, revokedAt: now } });
    sessionsRevoked = activeSessions.map(s => s._id);

    await ActivityLog.create({
      userId,
      action: activityAction,
      category: ACTIVITY_CATEGORIES.SECURITY,
      description: updates.twoFactorEnabled ? `2FA enabled (fallback)` : '2FA disabled (fallback)'
    });

    return { security: sanitizeSecurity(updatedSettings), sessionsRevoked: true };
  } catch (err) {
    logger.error({ err }, 'Error during sequential security change; commencing rollback compensation');

    try {
      if (settingsUpdated) {
        await SecuritySettings.findOneAndUpdate(
          { userId },
          {
            $set: {
              twoFactorEnabled: oldSettings.twoFactorEnabled,
              twoFactorMethod: oldSettings.twoFactorMethod
            }
          }
        );
      }
      if (sessionsRevoked.length > 0) {
        await UserSession.updateMany(
          { _id: { $in: sessionsRevoked } },
          { $set: { isActive: true }, $unset: { revokedAt: "" } }
        );
      }
    } catch (rollbackErr) {
      logger.fatal({ err: rollbackErr }, 'CRITICAL ERROR: Security update sequential compensation rollback failed.');
    }

    throw new ApiError(500, 'Security settings update failed due to database execution error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};
