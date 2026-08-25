import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const dashboardApi = {
  getDashboard: () => {
    return apiClient.get(API_ENDPOINTS.DASHBOARD);
  },
};

export default dashboardApi;
