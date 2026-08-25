import * as activityLogService from '../services/activityLog.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page, limit, category } = req.query;
  const result = await activityLogService.getActivityLogs(req.user.id, { page, limit, category });
  return ApiResponse.success(res, 'Activity logs retrieved successfully', result, 200);
});

export default {
  getActivityLogs
};
