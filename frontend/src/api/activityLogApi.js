import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const activityLogApi = {

  getActivityLogs: ({ page = 1, limit = 20, category } = {}) => {
    const params = {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    };

    if (category && typeof category === 'string' && category.trim()) {
      params.category = category.trim();
    }

    return apiClient.get(API_ENDPOINTS.ACTIVITY_LOGS, { params });
  },
};

export default activityLogApi;
