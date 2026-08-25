import { createSlice } from '@reduxjs/toolkit';

export const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const SENSITIVE_KEYS = new Set([
    'token',
    'secret',
    'password',
    'passwordhash',
    'refreshtoken',
    'refreshtokenhash',
    'resettoken',
    'tokenhash',
    'accesstoken',
    'jwt',
    'authorization',
    'cookie',
  ]);

  const clean = {};
  for (const [key, val] of Object.entries(metadata)) {
    if (!SENSITIVE_KEYS.has(key.toLowerCase()) && typeof val !== 'function') {
      if (typeof val === 'object' && val !== null) {
        clean[key] = sanitizeMetadata(val);
      } else {
        clean[key] = val;
      }
    }
  }

  return Object.keys(clean).length > 0 ? clean : null;
};

export const sanitizeActivityLog = (log) => {
  if (!log || typeof log !== 'object') return null;

  return {
    id: log.id || log._id || '',
    action: typeof log.action === 'string' ? log.action : 'UNKNOWN_ACTION',
    category: typeof log.category === 'string' ? log.category : 'GENERAL',
    description: typeof log.description === 'string' ? log.description : '',
    deviceName: typeof log.deviceName === 'string' ? log.deviceName : null,
    browser: typeof log.browser === 'string' ? log.browser : null,
    operatingSystem: typeof log.operatingSystem === 'string' ? log.operatingSystem : null,
    ipAddress: typeof log.ipAddress === 'string' ? log.ipAddress : null,
    metadata: sanitizeMetadata(log.metadata),
    createdAt: log.createdAt || null,
  };
};

const initialState = {
  logs: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  selectedCategory: null,
  isLoading: false,
  error: null,
  loaded: false,
};

export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    fetchActivityLogsRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
      if (action.payload?.category !== undefined) {
        state.selectedCategory = action.payload.category;
      }
      if (action.payload?.page !== undefined) {
        state.pagination.page = action.payload.page;
      }
    },
    fetchActivityLogsSuccess: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      const rawLogs = action.payload?.logs || [];
      state.logs = rawLogs.map(sanitizeActivityLog).filter(Boolean);

      const pag = action.payload?.pagination;
      if (pag) {
        state.pagination = {
          total: Number(pag.total) || 0,
          page: Number(pag.page) || 1,
          limit: Number(pag.limit) || 20,
          pages: Number(pag.pages) || 0,
        };
      }
      state.error = null;
    },
    fetchActivityLogsFailure: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      state.error = action.payload;
    },
    setActivityCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.pagination.page = 1;
      state.error = null;
    },
    setActivityPage: (state, action) => {
      state.pagination.page = action.payload;
      state.error = null;
    },
    clearActivityError: (state) => {
      state.error = null;
    },
    clearActivityLogs: (state) => {
      state.logs = [];
      state.pagination = {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0,
      };
      state.selectedCategory = null;
      state.isLoading = false;
      state.error = null;
      state.loaded = false;
    },
  },
});

export const {
  fetchActivityLogsRequest,
  fetchActivityLogsSuccess,
  fetchActivityLogsFailure,
  setActivityCategory,
  setActivityPage,
  clearActivityError,
  clearActivityLogs,
} = activityLogSlice.actions;

export default activityLogSlice.reducer;
