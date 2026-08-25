import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const authApi = {

  register: (userData) => {
    return apiClient.post(API_ENDPOINTS.AUTH_REGISTER, userData);
  },

  login: (credentials) => {
    return apiClient.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
  },

  refresh: () => {
    return apiClient.post(API_ENDPOINTS.AUTH_REFRESH);
  },

  logout: () => {
    return apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
  },

  logoutAll: () => {
    return apiClient.post(API_ENDPOINTS.AUTH_LOGOUT_ALL);
  },

  forgotPassword: (email) => {
    return apiClient.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  },

  resetPassword: ({ token, newPassword }) => {
    return apiClient.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { token, newPassword });
  },
};

export default authApi;
