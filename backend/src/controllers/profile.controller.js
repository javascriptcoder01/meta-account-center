import * as profileService from '../services/profile.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const getClearCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth'
  };
};

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);
  return ApiResponse.success(res, 'Profile retrieved successfully', { user: profile }, 200);
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'Request body cannot be empty', ERROR_CODES.VALIDATION_ERROR);
  }

  const profile = await profileService.updateProfile(req.user.id, req.body);
  return ApiResponse.success(res, 'Profile updated successfully', { user: profile }, 200);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await profileService.changePassword(req.user.id, currentPassword, newPassword);

  res.clearCookie('refreshToken', getClearCookieOptions());

  return ApiResponse.success(res, 'Password changed successfully. Please login again.', {}, 200);
});

export const changeEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await profileService.changeEmail(req.user.id, email);

  res.clearCookie('refreshToken', getClearCookieOptions());

  return ApiResponse.success(res, 'Email address updated successfully. Please login again.', {}, 200);
});

export const changePhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const profile = await profileService.changePhone(req.user.id, phone);
  return ApiResponse.success(res, 'Phone number updated successfully', { user: profile }, 200);
});

export const changeProfilePicture = asyncHandler(async (req, res) => {
  const { profilePicture } = req.body;
  const profile = await profileService.changeProfilePicture(req.user.id, profilePicture);
  return ApiResponse.success(res, 'Profile picture updated successfully', { user: profile }, 200);
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  changeEmail,
  changePhone,
  changeProfilePicture
};
