import * as connectedAccountService from '../services/connectedAccount.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const getConnectedAccounts = asyncHandler(async (req, res) => {
  const accounts = await connectedAccountService.getConnectedAccounts(req.user.id);
  return ApiResponse.success(res, 'Connected accounts retrieved successfully', { accounts }, 200);
});

export const connectAccount = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'Request body cannot be empty', ERROR_CODES.VALIDATION_ERROR);
  }

  const { provider, providerUserId, displayName, username, profilePicture } = req.body;
  const whitelistData = { provider, providerUserId, displayName, username, profilePicture };

  const account = await connectedAccountService.connectAccount(req.user.id, whitelistData);
  return ApiResponse.success(res, 'Mock account connected successfully', { account }, 201);
});

export const removeAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await connectedAccountService.removeAccount(req.user.id, id);
  return ApiResponse.success(res, 'Mock account removed successfully', {}, 200);
});

export default {
  getConnectedAccounts,
  connectAccount,
  removeAccount
};
