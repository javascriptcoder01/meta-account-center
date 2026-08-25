import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const profileApi = {

  getProfile: () => {
    return apiClient.get(API_ENDPOINTS.PROFILE);
  },

  updateProfile: (payload) => {
    return apiClient.patch(API_ENDPOINTS.PROFILE, payload);
  },

  changePassword: (payload) => {
    return apiClient.post(API_ENDPOINTS.PROFILE_CHANGE_PASSWORD, payload);
  },

  changeEmail: (payload) => {
    return apiClient.patch(API_ENDPOINTS.PROFILE_EMAIL, payload);
  },

  changePhone: (payload) => {
    return apiClient.patch(API_ENDPOINTS.PROFILE_PHONE, payload);
  },

  changeProfilePicture: (payload) => {
    return apiClient.patch(API_ENDPOINTS.PROFILE_PICTURE, payload);
  },
};

export default profileApi;
