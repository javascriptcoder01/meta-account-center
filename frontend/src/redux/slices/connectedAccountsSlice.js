import { createSlice } from '@reduxjs/toolkit';
import { ALLOWED_PROVIDERS } from '../../constants/providers.js';

export const sanitizeAccount = (account) => {
  if (!account || typeof account !== 'object') return null;

  const provider = typeof account.provider === 'string' ? account.provider.toUpperCase() : '';
  const validProvider = ALLOWED_PROVIDERS.includes(provider) ? provider : 'FACEBOOK';

  return {
    id: account.id || account._id || '',
    provider: validProvider,
    providerUserId: typeof account.providerUserId === 'string' ? account.providerUserId : '',
    displayName: typeof account.displayName === 'string' ? account.displayName : '',
    username: typeof account.username === 'string' ? account.username : null,
    profilePicture: typeof account.profilePicture === 'string' ? account.profilePicture : null,
    status: typeof account.status === 'string' ? account.status : 'ACTIVE',
    connectedAt: account.connectedAt || null,
    updatedAt: account.updatedAt || null,
  };
};

const initialState = {
  accounts: [],
  isLoading: false,
  isConnecting: false,
  disconnectingId: null,
  error: null,
  successMessage: null,
  loaded: false,
};

export const connectedAccountsSlice = createSlice({
  name: 'connectedAccounts',
  initialState,
  reducers: {

    fetchConnectedAccountsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchConnectedAccountsSuccess: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      const rawAccounts = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.accounts || [];
      state.accounts = rawAccounts.map(sanitizeAccount).filter(Boolean);
      state.error = null;
    },
    fetchConnectedAccountsFailure: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      state.error = action.payload;
    },

    connectAccountRequest: (state, _action) => {
      state.isConnecting = true;
      state.error = null;
      state.successMessage = null;
    },
    connectAccountSuccess: (state, action) => {
      state.isConnecting = false;
      const newAccount = sanitizeAccount(action.payload?.account || action.payload);
      if (newAccount && !state.accounts.some((acc) => acc.id === newAccount.id)) {
        state.accounts.push(newAccount);
      }
      state.successMessage = action.payload?.message || 'Account connected successfully.';
      state.error = null;
    },
    connectAccountFailure: (state, action) => {
      state.isConnecting = false;
      state.error = action.payload;
    },

    disconnectAccountRequest: (state, action) => {
      state.disconnectingId = action.payload;
      state.error = null;
      state.successMessage = null;
    },
    disconnectAccountSuccess: (state, action) => {
      const removedId = action.payload?.accountId || state.disconnectingId;
      state.disconnectingId = null;
      state.accounts = state.accounts.filter((acc) => acc.id !== removedId);
      state.successMessage = action.payload?.message || 'Account disconnected successfully.';
      state.error = null;
    },
    disconnectAccountFailure: (state, action) => {
      state.disconnectingId = null;
      state.error = action.payload;
    },

    clearConnectedAccountsError: (state) => {
      state.error = null;
    },
    clearConnectedAccountsSuccess: (state) => {
      state.successMessage = null;
    },
    clearConnectedAccounts: (state) => {
      state.accounts = [];
      state.isLoading = false;
      state.isConnecting = false;
      state.disconnectingId = null;
      state.error = null;
      state.successMessage = null;
      state.loaded = false;
    },
  },
});

export const {
  fetchConnectedAccountsRequest,
  fetchConnectedAccountsSuccess,
  fetchConnectedAccountsFailure,
  connectAccountRequest,
  connectAccountSuccess,
  connectAccountFailure,
  disconnectAccountRequest,
  disconnectAccountSuccess,
  disconnectAccountFailure,
  clearConnectedAccountsError,
  clearConnectedAccountsSuccess,
  clearConnectedAccounts,
} = connectedAccountsSlice.actions;

export default connectedAccountsSlice.reducer;
