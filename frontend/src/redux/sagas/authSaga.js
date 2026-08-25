import { call, put, takeLatest, all } from 'redux-saga/effects';
import authApi from '../../api/authApi.js';
import { setClientAccessToken } from '../../api/apiClient.js';
import normalizeApiError from '../../api/apiError.js';
import {
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
  logoutAllRequest,
  logoutAllSuccess,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
} from '../slices/authSlice.js';

export function* initializeAuthSaga() {
  try {
    const response = yield call(authApi.refresh);
    const accessToken = response?.data?.data?.accessToken;
    const user = response?.data?.data?.user;

    if (accessToken) {
      setClientAccessToken(accessToken);
      yield put(initializeAuthSuccess({ accessToken, user }));
    } else {
      setClientAccessToken(null);
      yield put(initializeAuthFailure());
    }
  } catch {
    setClientAccessToken(null);
    yield put(initializeAuthFailure());
  }
}

export function* loginSaga(action) {
  try {
    const response = yield call(authApi.login, action.payload);
    const { accessToken, user } = response?.data?.data || {};

    if (!accessToken) {
      throw new Error('Authentication succeeded but access token is missing');
    }

    setClientAccessToken(accessToken);
    yield put(loginSuccess({ accessToken, user }));
  } catch (error) {
    setClientAccessToken(null);
    const normalized = normalizeApiError(error);
    yield put(loginFailure(normalized.message));
  }
}

export function* registerSaga(action) {
  try {
    const response = yield call(authApi.register, action.payload);
    const message = response?.data?.message || 'Registration successful. You can now log in.';
    const user = response?.data?.data?.user;
    yield put(registerSuccess({ message, user }));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(registerFailure(normalized.message));
  }
}

export function* logoutSaga() {
  try {
    yield call(authApi.logout);
  } catch {
    // Client-side logout proceeds regardless of backend response
  } finally {
    setClientAccessToken(null);
    yield put(logoutSuccess());
  }
}

export function* logoutAllSaga() {
  try {
    yield call(authApi.logoutAll);
  } catch {
    // Client-side logout proceeds regardless of backend response
  } finally {
    setClientAccessToken(null);
    yield put(logoutAllSuccess());
  }
}

export function* forgotPasswordSaga(action) {
  try {
    const response = yield call(authApi.forgotPassword, action.payload.email);
    const message = response?.data?.message || 'If an account exists with this email, you will receive password reset instructions.';
    yield put(forgotPasswordSuccess(message));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(forgotPasswordFailure(normalized.message));
  }
}

export function* resetPasswordSaga(action) {
  try {
    const response = yield call(authApi.resetPassword, action.payload);
    const message = response?.data?.message || 'Password changed successfully. Please log in.';
    yield put(resetPasswordSuccess(message));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(resetPasswordFailure(normalized.message));
  }
}

export function* authSaga() {
  yield all([
    takeLatest(initializeAuthRequest.type, initializeAuthSaga),
    takeLatest(loginRequest.type, loginSaga),
    takeLatest(registerRequest.type, registerSaga),
    takeLatest(logoutRequest.type, logoutSaga),
    takeLatest(logoutAllRequest.type, logoutAllSaga),
    takeLatest(forgotPasswordRequest.type, forgotPasswordSaga),
    takeLatest(resetPasswordRequest.type, resetPasswordSaga),
  ]);
}

export default authSaga;
