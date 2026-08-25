import { createSlice } from '@reduxjs/toolkit';
import { ALLOWED_TWO_FACTOR_METHODS } from '../../constants/settingsConstants.js';

export const sanitizeSecuritySettings = (settings) => {
  if (!settings || typeof settings !== 'object') return null;

  const twoFactorEnabled = Boolean(settings.twoFactorEnabled);
  let twoFactorMethod = null;

  if (twoFactorEnabled) {
    const rawMethod = typeof settings.twoFactorMethod === 'string' ? settings.twoFactorMethod.toUpperCase() : '';
    twoFactorMethod = ALLOWED_TWO_FACTOR_METHODS.includes(rawMethod) ? rawMethod : 'SMS';
  }

  return {
    twoFactorEnabled,
    twoFactorMethod,
    lastPasswordChangedAt: settings.lastPasswordChangedAt || null,
  };
};

const initialState = {
  settings: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  successMessage: null,
  loaded: false,
};

export const securitySettingsSlice = createSlice({
  name: 'securitySettings',
  initialState,
  reducers: {
    fetchSecuritySettingsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSecuritySettingsSuccess: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      const raw = action.payload?.securitySettings || action.payload?.settings || action.payload;
      state.settings = sanitizeSecuritySettings(raw);
      state.error = null;
    },
    fetchSecuritySettingsFailure: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      state.error = action.payload;
    },
    updateSecuritySettingsRequest: (state, _action) => {
      state.isUpdating = true;
      state.error = null;
      state.successMessage = null;
    },
    updateSecuritySettingsSuccess: (state, action) => {
      state.isUpdating = false;
      const raw = action.payload?.securitySettings || action.payload?.settings || action.payload;
      state.settings = sanitizeSecuritySettings(raw);
      state.successMessage =
        action.payload?.message ||
        'Security settings updated. All active sessions were signed out. Please log in again.';
      state.error = null;
    },
    updateSecuritySettingsFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    },
    clearSecuritySettingsError: (state) => {
      state.error = null;
    },
    clearSecuritySettingsSuccess: (state) => {
      state.successMessage = null;
    },
    clearSecuritySettings: (state) => {
      state.settings = null;
      state.isLoading = false;
      state.isUpdating = false;
      state.error = null;
      state.successMessage = null;
      state.loaded = false;
    },
  },
});

export const {
  fetchSecuritySettingsRequest,
  fetchSecuritySettingsSuccess,
  fetchSecuritySettingsFailure,
  updateSecuritySettingsRequest,
  updateSecuritySettingsSuccess,
  updateSecuritySettingsFailure,
  clearSecuritySettingsError,
  clearSecuritySettingsSuccess,
  clearSecuritySettings,
} = securitySettingsSlice.actions;

export default securitySettingsSlice.reducer;
