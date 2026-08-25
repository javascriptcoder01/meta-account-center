import UserSession from '../models/UserSession.js';

export const findSessionBySessionId = async (sessionId) => {
  return UserSession.findOne({ sessionId });
};

export const findSessionByRefreshTokenHash = async (refreshTokenHash) => {
  return UserSession.findOne({ refreshTokenHash });
};

export const findActiveSessionsByUserId = async (userId) => {
  return UserSession.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

export const createSession = async (sessionData) => {
  return UserSession.create(sessionData);
};

export const updateSessionBySessionId = async (sessionId, updateData) => {
  return UserSession.findOneAndUpdate({ sessionId }, updateData, { new: true });
};

export const revokeAllSessionsExcept = async (userId, excludeSessionId) => {
  const now = new Date();
  return UserSession.updateMany(
    {
      userId,
      sessionId: { $ne: excludeSessionId },
      isActive: true,
      expiresAt: { $gt: now }
    },
    {
      $set: {
        isActive: false,
        revokedAt: now
      }
    }
  );
};

export const findSessionBySessionIdAndUserId = async (sessionId, userId) => {
  return UserSession.findOne({ sessionId, userId });
};

export default {
  findSessionBySessionId,
  findSessionByRefreshTokenHash,
  findActiveSessionsByUserId,
  createSession,
  updateSessionBySessionId,
  revokeAllSessionsExcept,
  findSessionBySessionIdAndUserId
};

