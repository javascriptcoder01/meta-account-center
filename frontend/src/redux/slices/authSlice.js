import { createSlice } from '@reduxjs/toolkit';

const sanitizeUser = (user) => {
  if (!user || typeof user !== 'object') return null;
  const { id, _id, email, firstName, lastName, phone, dateOfBirth, isTwoFactorEnabled, role, createdAt } = user;
  return {
    id: id || _id || '',
    email: email || '',
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || null,
    dateOfBirth: dateOfBirth || null,
    isTwoFactorEnabled: Boolean(isTwoFactorEnabled),
    role: role || 'user',
    createdAt: createdAt || null,
  };
};

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuthRequest: (state) => {
      state.isInitializing = true;
      state.error = null;
    },
    initializeAuthSuccess: (state, action) => {
      state.isInitializing = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload?.accessToken || null;
      state.user = sanitizeUser(action.payload?.user);
      state.error = null;
    },
    initializeAuthFailure: (state) => {
      state.isInitializing = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
    },

    loginRequest: (state, _action) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload?.accessToken || null;
      state.user = sanitizeUser(action.payload?.user);
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.error = action.payload;
    },

    registerRequest: (state, _action) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.successMessage = action.payload?.message || 'Registration successful. You can now log in.';
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    logoutRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.error = null;
      state.successMessage = null;
    },
    logoutFailure: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
    },

    logoutAllRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    logoutAllSuccess: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.error = null;
      state.successMessage = null;
    },
    logoutAllFailure: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
    },

    forgotPasswordRequest: (state, _action) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    },
    forgotPasswordSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.successMessage = action.payload || 'If an account exists with this email, you will receive password reset instructions.';
    },
    forgotPasswordFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetPasswordRequest: (state, _action) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    },
    resetPasswordSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.successMessage = action.payload || 'Password changed successfully. Please log in.';
    },
    resetPasswordFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    setAccessToken: (state, action) => {
      state.accessToken = action.payload || null;
      if (action.payload) {
        state.isAuthenticated = true;
      }
    },

    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
});

export const {
  initializeAuthRequest,
  initializeAuthSuccess,
  initializeAuthFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  logoutAllRequest,
  logoutAllSuccess,
  logoutAllFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  setAccessToken,
  clearAuth,
  clearAuthError,
  clearSuccessMessage,
} = authSlice.actions;

export default authSlice.reducer;
