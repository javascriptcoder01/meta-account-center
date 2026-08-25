import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import UserSession from '../models/UserSession.js';
import ApiError from '../utils/ApiError.js';
import { USER_STATUSES } from '../constants/statuses.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token is missing or malformed', ERROR_CODES.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtAccessSecret, { algorithms: ['HS256'] });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token has expired', ERROR_CODES.UNAUTHORIZED);
      }
      throw new ApiError(401, 'Invalid or signatures-failed access token', ERROR_CODES.UNAUTHORIZED);
    }

    const { sub: userId, role, sessionId } = decoded;

    if (!userId || !role || !sessionId) {
      throw new ApiError(401, 'Invalid access token claims structure', ERROR_CODES.UNAUTHORIZED);
    }

    const user = await User.findById(userId);
    if (!user || user.status !== USER_STATUSES.ACTIVE) {
      throw new ApiError(401, 'User account is inactive or suspended', ERROR_CODES.UNAUTHORIZED);
    }

    const session = await UserSession.findOne({ sessionId }).lean();
    if (
      !session ||
      !session.isActive ||
      session.revokedAt !== null ||
      session.expiresAt <= new Date() ||
      session.userId.toString() !== userId
    ) {
      throw new ApiError(401, 'Session has expired or was revoked', ERROR_CODES.UNAUTHORIZED);
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      sessionId: session.sessionId
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
