import ApiResponse from '../utils/ApiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const notFoundMiddleware = (req, res, next) => {
  return ApiResponse.error(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    ERROR_CODES.NOT_FOUND,
    [],
    404
  );
};

export default notFoundMiddleware;
