import { getDatabaseStatus } from '../config/database.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (req, res) => {
  const dbStatus = getDatabaseStatus();

  if (dbStatus !== 'UP') {
    return ApiResponse.error(
      res,
      'Service is unhealthy',
      'SERVICE_UNAVAILABLE',
      {
        status: 'DOWN',
        database: 'DOWN'
      },
      503
    );
  }

  return ApiResponse.success(
    res,
    'Service is healthy',
    {
      status: 'UP',
      database: 'UP'
    },
    200
  );
});

export default {
  getHealth
};
