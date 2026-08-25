import * as privacyService from '../services/privacy.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const getPrivacy = asyncHandler(async (req, res) => {
  const settings = await privacyService.getPrivacySettings(req.user.id);
  const sanitized = privacyService.sanitizePrivacy(settings);
  return ApiResponse.success(res, 'Privacy settings retrieved successfully', { privacy: sanitized }, 200);
});

export const updatePrivacy = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'Request body cannot be empty', ERROR_CODES.VALIDATION_ERROR);
  }

  const updated = await privacyService.updatePrivacySettings(req.user.id, req.body);
  return ApiResponse.success(res, 'Privacy settings updated successfully', { privacy: updated }, 200);
});

export default {
  getPrivacy,
  updatePrivacy
};
