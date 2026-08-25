import PasswordResetToken from '../models/PasswordResetToken.js';

export const findResetTokenByHash = async (tokenHash) => {
  return PasswordResetToken.findOne({ tokenHash });
};

export const createResetToken = async (tokenData) => {
  return PasswordResetToken.create(tokenData);
};

export const invalidatePriorTokens = async (userId) => {
  const now = new Date();
  return PasswordResetToken.updateMany(
    { userId, expiresAt: { $gt: now }, usedAt: null },
    { $set: { usedAt: now } }
  );
};

export default {
  findResetTokenByHash,
  createResetToken,
  invalidatePriorTokens
};
