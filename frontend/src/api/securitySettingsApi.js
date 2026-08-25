import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const securitySettingsApi = {
  getSecuritySettings: () => {
    return apiClient.get(API_ENDPOINTS.SECURITY_SETTINGS);
  },

  updateSecuritySettings: (payload) => {
    return apiClient.patch(API_ENDPOINTS.SECURITY_SETTINGS, payload);
  },
};

export default securitySettingsApi;
