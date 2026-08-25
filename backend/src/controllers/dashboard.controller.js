import * as dashboardService from '../services/dashboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const result = await dashboardService.getDashboardOverview(req.user.id);

  if (!result) {
    throw new ApiError(404, 'User not found', ERROR_CODES.NOT_FOUND);
  }

  return ApiResponse.success(res, 'Dashboard overview retrieved successfully', result, 200);
});

export default { getDashboardOverview };
