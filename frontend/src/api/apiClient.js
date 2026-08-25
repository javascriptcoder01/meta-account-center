import axios from 'axios';
import apiConfig from './apiConfig.js';
import API_ENDPOINTS from '../constants/apiConstants.js';

let inMemoryAccessToken = null;

let storeDispatch = null;
let onAuthFailedCallback = null;

export const setClientAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getClientAccessToken = () => {
  return inMemoryAccessToken;
};

export const injectStore = (dispatch, onAuthFailed) => {
  storeDispatch = dispatch;
  onAuthFailedCallback = onAuthFailed;
};

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout || 15000,
  headers: {
    ...apiConfig.headers,
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && typeof inMemoryAccessToken === 'string' && inMemoryAccessToken.trim().length > 0) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AUTH_BYPASS_URLS = [
  API_ENDPOINTS.AUTH_LOGIN,
  API_ENDPOINTS.AUTH_REGISTER,
  API_ENDPOINTS.AUTH_REFRESH,
  API_ENDPOINTS.AUTH_FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH_RESET_PASSWORD,
];

const isAuthBypassUrl = (url) => {
  if (!url) return false;
  return AUTH_BYPASS_URLS.some((endpoint) => url.includes(endpoint));
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (isAuthBypassUrl(originalRequest.url) || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${apiConfig.baseURL}${API_ENDPOINTS.AUTH_REFRESH}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const newAccessToken =
        refreshResponse.data &&
        refreshResponse.data.data &&
        refreshResponse.data.data.accessToken;

      if (!newAccessToken) {
        throw new Error('Refresh succeeded but no access token returned');
      }

      setClientAccessToken(newAccessToken);

      if (storeDispatch) {
        storeDispatch({ type: 'auth/setAccessToken', payload: newAccessToken });
      }

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      setClientAccessToken(null);
      processQueue(refreshError, null);

      if (onAuthFailedCallback) {
        onAuthFailedCallback();
      } else if (storeDispatch) {
        storeDispatch({ type: 'auth/clearAuth' });
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
