import * as deviceService from '../services/device.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/env.js';

const getClearCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    path: '/api/auth'
  };
};

export const getActiveDevices = asyncHandler(async (req, res) => {
  const devices = await deviceService.getActiveDevices(req.user.id);
  return ApiResponse.success(res, 'Active devices retrieved successfully', { devices }, 200);
});

export const revokeDeviceSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  await deviceService.revokeDeviceSession(req.user.id, sessionId);

  if (sessionId === req.user.sessionId) {
    res.clearCookie('refreshToken', getClearCookieOptions());
  }

  return ApiResponse.success(res, 'Device session revoked successfully', {}, 200);
});

export default {
  getActiveDevices,
  revokeDeviceSession
};
