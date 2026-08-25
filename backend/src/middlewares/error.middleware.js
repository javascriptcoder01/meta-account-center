import config from '../config/env.js';
import logger from '../config/logger.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong';
  let details = err.details || [];

  logger.error({
    message: err.message,
    stack: config.env !== 'production' ? err.stack : undefined,
    originalError: err
  }, 'Request error occurred');

  if (err.name === 'ValidationError') {
    statusCode = 422;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation input failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = ERROR_CODES.BAD_REQUEST;
    message = `Invalid input formatting: ${err.path}`;
    details = [{ path: err.path, value: err.value }];
  }

  if (err.code === 11000) {
    statusCode = 409;
    errorCode = ERROR_CODES.CONFLICT;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Resource collision: duplicate ${duplicatedField} specified`;
    details = [{ field: duplicatedField, value: err.keyValue[duplicatedField] }];
  }

  return ApiResponse.error(
    res,
    message,
    errorCode,
    details,
    statusCode
  );
};

export default errorMiddleware;
