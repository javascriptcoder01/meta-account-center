import apiClient from './apiClient.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

export const connectedAccountsApi = {

  getConnectedAccounts: () => {
    return apiClient.get(API_ENDPOINTS.CONNECTED_ACCOUNTS);
  },

  connectAccount: (payload) => {
    return apiClient.post(API_ENDPOINTS.CONNECTED_ACCOUNTS, payload);
  },

  disconnectAccount: (accountId) => {
    return apiClient.delete(`${API_ENDPOINTS.CONNECTED_ACCOUNTS}/${encodeURIComponent(accountId)}`);
  },
};

export default connectedAccountsApi;
