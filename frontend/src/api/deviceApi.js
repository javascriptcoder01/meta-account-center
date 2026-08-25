import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const deviceApi = {

  getDevices: () => {
    return apiClient.get(API_ENDPOINTS.DEVICES);
  },

  revokeDevice: (sessionId) => {
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      return Promise.reject(new Error('Session ID is required to revoke device.'));
    }

    return apiClient.delete(`${API_ENDPOINTS.DEVICES}/${encodeURIComponent(sessionId.trim())}`);
  },
};

export default deviceApi;
