import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';
import profileReducer from './slices/profileSlice.js';
import connectedAccountsReducer from './slices/connectedAccountsSlice.js';
import privacyReducer from './slices/privacySlice.js';
import securitySettingsReducer from './slices/securitySettingsSlice.js';
import activityLogReducer from './slices/activityLogSlice.js';
import deviceReducer from './slices/deviceSlice.js';

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  profile: profileReducer,
  connectedAccounts: connectedAccountsReducer,
  privacy: privacyReducer,
  securitySettings: securitySettingsReducer,
  activityLog: activityLogReducer,
  device: deviceReducer,
});

export default rootReducer;
