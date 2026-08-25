import { createSlice } from '@reduxjs/toolkit';

const sanitizeDashboardData = (data) => {
  if (!data || typeof data !== 'object') return null;

  const profile = data.profile || {};
  const connectedAccounts = data.connectedAccounts || {};
  const securityStatus = data.securityStatus || {};
  const recentActivities = Array.isArray(data.recentActivities) ? data.recentActivities : [];
  const connectedDevices = Array.isArray(data.connectedDevices) ? data.connectedDevices : [];

  return {
    profile: {
      firstName: typeof profile.firstName === 'string' ? profile.firstName : '',
      lastName: typeof profile.lastName === 'string' ? profile.lastName : '',
      email: typeof profile.email === 'string' ? profile.email : '',
      phone: typeof profile.phone === 'string' ? profile.phone : null,
      profilePicture: typeof profile.profilePicture === 'string' ? profile.profilePicture : null,
      dateOfBirth: typeof profile.dateOfBirth === 'string' ? profile.dateOfBirth : null,
    },
    connectedAccounts: {
      count: typeof connectedAccounts.count === 'number' ? connectedAccounts.count : 0,
      accounts: Array.isArray(connectedAccounts.accounts)
        ? connectedAccounts.accounts.map((acc) => ({
          id: acc.id || acc._id || '',
          provider: typeof acc.provider === 'string' ? acc.provider : 'UNKNOWN',
          displayName: typeof acc.displayName === 'string' ? acc.displayName : null,
          username: typeof acc.username === 'string' ? acc.username : null,
          connectedAt: acc.connectedAt || null,
        }))
        : [],
    },
    securityStatus: {
      twoFactorEnabled: Boolean(securityStatus.twoFactorEnabled),
      twoFactorMethod: ['SMS', 'AUTHENTICATOR_APP', 'EMAIL'].includes(securityStatus.twoFactorMethod)
        ? securityStatus.twoFactorMethod
        : null,
      activeDeviceCount: typeof securityStatus.activeDeviceCount === 'number' ? securityStatus.activeDeviceCount : 0,
    },
    recentActivities: recentActivities.map((act) => ({
      id: act.id || act._id || '',
      action: typeof act.action === 'string' ? act.action : '',
      category: typeof act.category === 'string' ? act.category : 'GENERAL',
      description: typeof act.description === 'string' ? act.description : '',
      createdAt: act.createdAt || null,
    })),
    connectedDevices: connectedDevices.map((dev) => ({
      id: dev.id || dev._id || dev.sessionId || '',
      sessionId: typeof dev.sessionId === 'string' ? dev.sessionId : '',
      deviceName: typeof dev.deviceName === 'string' ? dev.deviceName : 'Unknown Device',
      browser: typeof dev.browser === 'string' ? dev.browser : 'Unknown Browser',
      browserVersion: typeof dev.browserVersion === 'string' ? dev.browserVersion : null,
      operatingSystem: typeof dev.operatingSystem === 'string' ? dev.operatingSystem : 'Unknown OS',
      ipAddress: typeof dev.ipAddress === 'string' ? dev.ipAddress : null,
      lastActivityAt: dev.lastActivityAt || dev.loginAt || null,
    })),
  };
};

const initialState = {
  data: null,
  isLoading: false,
  error: null,
  loaded: false,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (state, action) => {
      state.isLoading = false;
      state.data = sanitizeDashboardData(action.payload);
      state.loaded = true;
      state.error = null;
    },
    fetchDashboardFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearDashboard: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
      state.loaded = false;
    },
  },
});

export const {
  fetchDashboardRequest,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
