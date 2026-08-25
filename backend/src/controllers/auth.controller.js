import * as authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/env.js';

const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
};

const getClearCookieOptions = () => {
  const options = getCookieOptions();
  delete options.maxAge;
  return options;
};


const parseCookies = (req) => {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
};

const parseClientTelemetry = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

  let browser = 'Unknown Browser';
  let browserVersion = 'Unknown';
  let operatingSystem = 'Unknown OS';
  let deviceName = 'Desktop';

  if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }

  if (userAgent.includes('Windows')) {
    operatingSystem = 'Windows';
  } else if (userAgent.includes('Macintosh')) {
    operatingSystem = 'macOS';
  } else if (userAgent.includes('iPhone')) {
    operatingSystem = 'iOS';
    deviceName = 'iPhone';
  } else if (userAgent.includes('Android')) {
    operatingSystem = 'Android';
    deviceName = 'Android Device';
  } else if (userAgent.includes('Linux')) {
    operatingSystem = 'Linux';
  }

  return {
    deviceName,
    browser,
    browserVersion,
    operatingSystem,
    ipAddress,
    userAgent
  };
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  return ApiResponse.success(res, 'Registration successful', { user }, 201);
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const telemetry = parseClientTelemetry(req);

  const result = await authService.loginUser(email, password, telemetry);

  res.cookie('refreshToken', result.refreshToken, getCookieOptions());

  return ApiResponse.success(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken
  }, 200);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.sessionId, req.user.id);

  res.clearCookie('refreshToken', getClearCookieOptions());

  return ApiResponse.success(res, 'Logout successful', {}, 200);
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAllDevices(req.user.id);

  res.clearCookie('refreshToken', getClearCookieOptions());

  return ApiResponse.success(res, 'Successfully logged out from all devices', {}, 200);
});

export const refresh = asyncHandler(async (req, res) => {
  const cookies = parseCookies(req);
  const { refreshToken } = cookies;

  if (!refreshToken) {
    return ApiResponse.error(res, 'Refresh token cookie is missing', 'UNAUTHORIZED', [], 401);
  }

  const result = await authService.rotateRefreshToken(refreshToken);

  res.cookie('refreshToken', result.refreshToken, getCookieOptions());

  return ApiResponse.success(res, 'Token refreshed successfully', {
    accessToken: result.accessToken
  }, 200);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return ApiResponse.success(res, result.message, {}, 200);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);

  res.clearCookie('refreshToken', getClearCookieOptions());

  return ApiResponse.success(res, 'Password changed successfully', {}, 200);
});

export default {
  register,
  login,
  logout,
  logoutAll,
  refresh,
  forgotPassword,
  resetPassword
};
