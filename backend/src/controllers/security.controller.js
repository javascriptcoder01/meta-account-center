import * as securityService from '../services/security.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import config from '../config/env.js';

const getClearCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth'
  };
};

export const getSecuritySettings = asyncHandler(async (req, res) => {
  const settings = await securityService.getSecuritySettings(req.user.id);
  const sanitized = securityService.sanitizeSecurity(settings);
  return ApiResponse.success(res, 'Security settings retrieved successfully', { security: sanitized }, 200);
});

export const updateSecuritySettings = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'Request body cannot be empty', ERROR_CODES.VALIDATION_ERROR);
  }

  const result = await securityService.updateSecuritySettings(req.user.id, req.body);

  if (result.sessionsRevoked) {
    res.clearCookie('refreshToken', getClearCookieOptions());
  }

  return ApiResponse.success(res, 'Security settings updated successfully', {
    security: result.security,
    sessionsRevoked: result.sessionsRevoked
  }, 200);
});

export default {
  getSecuritySettings,
  updateSecuritySettings
};
