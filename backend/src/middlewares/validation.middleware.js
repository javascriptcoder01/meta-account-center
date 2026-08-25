import { validationResult } from 'express-validator';
import ApiResponse from '../utils/ApiResponse.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      location: err.location
    }));

    return ApiResponse.error(
      res,
      'Validation input failed',
      ERROR_CODES.VALIDATION_ERROR,
      formattedErrors,
      422
    );
  }
  next();
};

export default validateRequest;
