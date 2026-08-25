import { createSlice } from '@reduxjs/toolkit';
import { ALLOWED_VISIBILITIES } from '../../constants/settingsConstants.js';

export const sanitizePrivacySettings = (settings) => {
  if (!settings || typeof settings !== 'object') return null;

  const profileVis = typeof settings.profileVisibility === 'string' ? settings.profileVisibility.toUpperCase() : '';
  const emailVis = typeof settings.emailVisibility === 'string' ? settings.emailVisibility.toUpperCase() : '';
  const phoneVis = typeof settings.phoneVisibility === 'string' ? settings.phoneVisibility.toUpperCase() : '';

  return {
    profileVisibility: ALLOWED_VISIBILITIES.includes(profileVis) ? profileVis : 'PUBLIC',
    emailVisibility: ALLOWED_VISIBILITIES.includes(emailVis) ? emailVis : 'PRIVATE',
    phoneVisibility: ALLOWED_VISIBILITIES.includes(phoneVis) ? phoneVis : 'PRIVATE',
    personalizedAds: typeof settings.personalizedAds === 'boolean' ? settings.personalizedAds : true,
    dataSharing: typeof settings.dataSharing === 'boolean' ? settings.dataSharing : false,
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

export const privacySlice = createSlice({
  name: 'privacy',
  initialState,
  reducers: {
    fetchPrivacyRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPrivacySuccess: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      const raw = action.payload?.privacySettings || action.payload?.settings || action.payload;
      state.settings = sanitizePrivacySettings(raw);
      state.error = null;
    },
    fetchPrivacyFailure: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      state.error = action.payload;
    },
    updatePrivacyRequest: (state, _action) => {
      state.isUpdating = true;
      state.error = null;
      state.successMessage = null;
    },
    updatePrivacySuccess: (state, action) => {
      state.isUpdating = false;
      const raw = action.payload?.privacySettings || action.payload?.settings || action.payload?.user || action.payload;
      state.settings = sanitizePrivacySettings(raw);
      state.successMessage = action.payload?.message || 'Privacy settings updated successfully.';
      state.error = null;
    },
    updatePrivacyFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    },
    clearPrivacyError: (state) => {
      state.error = null;
    },
    clearPrivacySuccess: (state) => {
      state.successMessage = null;
    },
    clearPrivacy: (state) => {
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
  fetchPrivacyRequest,
  fetchPrivacySuccess,
  fetchPrivacyFailure,
  updatePrivacyRequest,
  updatePrivacySuccess,
  updatePrivacyFailure,
  clearPrivacyError,
  clearPrivacySuccess,
  clearPrivacy,
} = privacySlice.actions;

export default privacySlice.reducer;
