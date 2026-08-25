import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const privacyApi = {

  getPrivacySettings: () => {
    return apiClient.get(API_ENDPOINTS.PRIVACY);
  },

  updatePrivacySettings: (payload) => {
    return apiClient.patch(API_ENDPOINTS.PRIVACY, payload);
  },
};

export default privacyApi;
