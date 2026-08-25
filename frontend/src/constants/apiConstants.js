
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_LOGOUT_ALL: '/auth/logout-all',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',

  // Profile
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
  PROFILE_EMAIL: '/profile/email',
  PROFILE_PHONE: '/profile/phone',
  PROFILE_PICTURE: '/profile/profile-picture',

  // Privacy
  PRIVACY: '/privacy',

  // Security
  SECURITY_SETTINGS: '/security/settings',

  // Connected Accounts
  CONNECTED_ACCOUNTS: '/connected-accounts',

  // Activity Logs
  ACTIVITY_LOGS: '/activity-logs',

  // Devices
  DEVICES: '/devices',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Health
  HEALTH: '/health',
};

export default API_ENDPOINTS;
