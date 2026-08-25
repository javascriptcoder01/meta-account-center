import { createSlice } from '@reduxjs/toolkit';

export const sanitizeDevice = (device) => {
  if (!device || typeof device !== 'object') return null;

  return {
    id: device.id || device._id || '',
    sessionId: typeof device.sessionId === 'string' ? device.sessionId : '',
    deviceName: typeof device.deviceName === 'string' ? device.deviceName : 'Unknown Device',
    browser: typeof device.browser === 'string' ? device.browser : 'Unknown Browser',
    browserVersion: typeof device.browserVersion === 'string' ? device.browserVersion : null,
    operatingSystem: typeof device.operatingSystem === 'string' ? device.operatingSystem : 'Unknown OS',
    ipAddress: typeof device.ipAddress === 'string' ? device.ipAddress : null,
    loginAt: device.loginAt || null,
    lastActivityAt: device.lastActivityAt || null,
  };
};

const initialState = {
  devices: [],
  isLoading: false,
  isRevoking: false,
  revokingSessionId: null,
  error: null,
  successMessage: null,
  loaded: false,
};

export const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    fetchDevicesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDevicesSuccess: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      const raw = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.devices || [];
      state.devices = raw.map(sanitizeDevice).filter(Boolean);
      state.error = null;
    },
    fetchDevicesFailure: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      state.error = action.payload;
    },
    revokeDeviceRequest: (state, action) => {
      state.isRevoking = true;
      state.revokingSessionId = action.payload;
      state.error = null;
      state.successMessage = null;
    },
    revokeDeviceSuccess: (state, action) => {
      state.isRevoking = false;
      const removedSessionId = action.payload?.sessionId || state.revokingSessionId;
      state.revokingSessionId = null;
      state.devices = state.devices.filter((d) => d.sessionId !== removedSessionId);
      state.successMessage = action.payload?.message || 'Device signed out successfully.';
      state.error = null;
    },
    revokeDeviceFailure: (state, action) => {
      state.isRevoking = false;
      state.revokingSessionId = null;
      state.error = action.payload;
    },
    clearDeviceError: (state) => {
      state.error = null;
    },
    clearDeviceSuccess: (state) => {
      state.successMessage = null;
    },
    clearDevices: (state) => {
      state.devices = [];
      state.isLoading = false;
      state.isRevoking = false;
      state.revokingSessionId = null;
      state.error = null;
      state.successMessage = null;
      state.loaded = false;
    },
  },
});

export const {
  fetchDevicesRequest,
  fetchDevicesSuccess,
  fetchDevicesFailure,
  revokeDeviceRequest,
  revokeDeviceSuccess,
  revokeDeviceFailure,
  clearDeviceError,
  clearDeviceSuccess,
  clearDevices,
} = deviceSlice.actions;

export default deviceSlice.reducer;
