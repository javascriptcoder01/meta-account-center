import mongoose from 'mongoose';
import ConnectedAccount from '../models/ConnectedAccount.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import { ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const sanitizeAccount = (account) => {
  return {
    id: account._id,
    provider: account.provider,
    providerUserId: account.providerUserId,
    username: account.username,
    displayName: account.displayName,
    profilePicture: account.profilePicture,
    status: account.status,
    connectedAt: account.connectedAt
  };
};

export const getConnectedAccounts = async (userId) => {
  const accounts = await ConnectedAccount.find({ userId });
  return accounts.map(sanitizeAccount);
};

export const connectAccount = async (userId, accountData) => {
  const { provider, providerUserId, displayName, username, profilePicture } = accountData;

  const existingLink = await ConnectedAccount.findOne({ provider, providerUserId });
  if (existingLink) {
    throw new ApiError(409, 'This social account is already linked to another Meta account', ERROR_CODES.CONFLICT);
  }

  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    const [newAccount] = await ConnectedAccount.create(
      [
        {
          userId,
          provider,
          providerUserId,
          displayName,
          username: username || null,
          profilePicture: profilePicture || null,
          status: 'CONNECTED',
          connectedAt: new Date()
        }
      ],
      { session: mongooseSession }
    );

    await ActivityLog.create(
      [
        {
          userId,
          action: ACTIVITY_ACTIONS.ACCOUNT_CONNECTED,
          category: ACTIVITY_CATEGORIES.CONNECTED_ACCOUNT,
          description: `Linked ${provider} account successfully`,
          metadata: { provider }
        }
      ],
      { session: mongooseSession }
    );

    await mongooseSession.commitTransaction();
    mongooseSession.endSession();

    return sanitizeAccount(newAccount);
  } catch (error) {
    await mongooseSession.abortTransaction();
    mongooseSession.endSession();

    const isTransactionUnsupported = error.message.includes('transaction') || error.code === 20;

    if (isTransactionUnsupported) {
      logger.warn('MongoDB Transactions are unsupported in this environment. Falling back to compensated sequential writes for Connected Accounts.');
      return await connectAccountSequentialFallback(userId, accountData);
    }

    throw error;
  }
};

const connectAccountSequentialFallback = async (userId, accountData) => {
  const { provider, providerUserId, displayName, username, profilePicture } = accountData;
  let accountCreated = null;

  try {
    accountCreated = await ConnectedAccount.create({
      userId,
      provider,
      providerUserId,
      displayName,
      username: username || null,
      profilePicture: profilePicture || null,
      status: 'CONNECTED',
      connectedAt: new Date()
    });

    await ActivityLog.create({
      userId,
      action: ACTIVITY_ACTIONS.ACCOUNT_CONNECTED,
      category: ACTIVITY_CATEGORIES.CONNECTED_ACCOUNT,
      description: `Linked ${provider} account (fallback)`,
      metadata: { provider }
    });

    return sanitizeAccount(accountCreated);
  } catch (err) {
    logger.error({ err }, 'Error during sequential account link; commencing rollback compensation');

    if (accountCreated) {
      try {
        await ConnectedAccount.findByIdAndDelete(accountCreated._id);
      } catch (rollbackErr) {
        logger.fatal({ err: rollbackErr }, 'CRITICAL ERROR: Connected account sequential compensation rollback failed.');
      }
    }

    throw new ApiError(500, 'Mock connection failed due to database execution error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const removeAccount = async (userId, accountId) => {
  const account = await ConnectedAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new ApiError(404, 'Connected account not found or access denied', ERROR_CODES.NOT_FOUND);
  }

  const provider = account.provider;
  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    await ConnectedAccount.deleteOne({ _id: accountId, userId }, { session: mongooseSession });

    await ActivityLog.create(
      [
        {
          userId,
          action: ACTIVITY_ACTIONS.ACCOUNT_DISCONNECTED,
          category: ACTIVITY_CATEGORIES.CONNECTED_ACCOUNT,
          description: `Unlinked ${provider} account successfully`,
          metadata: { provider }
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
      logger.warn('MongoDB Transactions are unsupported in this environment. Falling back to compensated sequential deletes.');
      return await removeAccountSequentialFallback(userId, account, accountId);
    }

    throw error;
  }
};

const removeAccountSequentialFallback = async (userId, oldAccount, accountId) => {
  let deleted = false;

  try {
    await ConnectedAccount.deleteOne({ _id: accountId, userId });
    deleted = true;

    await ActivityLog.create({
      userId,
      action: ACTIVITY_ACTIONS.ACCOUNT_DISCONNECTED,
      category: ACTIVITY_CATEGORIES.CONNECTED_ACCOUNT,
      description: `Unlinked ${oldAccount.provider} account (fallback)`,
      metadata: { provider: oldAccount.provider }
    });

    return true;
  } catch (err) {
    logger.error({ err }, 'Error during sequential account unlink; commencing rollback compensation');

    if (deleted) {
      try {
        await ConnectedAccount.create(oldAccount);
      } catch (rollbackErr) {
        logger.fatal({ err: rollbackErr }, 'CRITICAL ERROR: Connected account removal sequential compensation rollback failed.');
      }
    }

    throw new ApiError(500, 'Mock disconnect failed due to database execution error', ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
};
