import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', ERROR_CODES.UNAUTHORIZED);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, 'You do not have permission to access this resource', ERROR_CODES.FORBIDDEN);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorizeRoles;
