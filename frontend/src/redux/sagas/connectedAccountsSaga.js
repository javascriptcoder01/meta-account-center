import { call, put, takeLatest, all } from 'redux-saga/effects';
import connectedAccountsApi from '../../api/connectedAccountsApi.js';
import normalizeApiError from '../../api/apiError.js';
import {
  fetchConnectedAccountsRequest,
  fetchConnectedAccountsSuccess,
  fetchConnectedAccountsFailure,
  connectAccountRequest,
  connectAccountSuccess,
  connectAccountFailure,
  disconnectAccountRequest,
  disconnectAccountSuccess,
  disconnectAccountFailure,
} from '../slices/connectedAccountsSlice.js';

export function* fetchConnectedAccountsWorker() {
  try {
    const response = yield call(connectedAccountsApi.getConnectedAccounts);
    const accounts = response?.data?.data?.accounts || response?.data?.data || [];
    yield put(fetchConnectedAccountsSuccess(accounts));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(
      fetchConnectedAccountsFailure(normalized.message || 'Unable to load connected accounts.')
    );
  }
}

export function* connectAccountWorker(action) {
  try {
    const { provider, providerUserId, displayName, username, profilePicture } = action.payload || {};

    const safePayload = {
      provider: typeof provider === 'string' ? provider.trim().toUpperCase() : '',
      providerUserId: typeof providerUserId === 'string' ? providerUserId.trim() : '',
      displayName: typeof displayName === 'string' ? displayName.trim() : '',
    };

    if (username) safePayload.username = String(username).trim();
    if (profilePicture) safePayload.profilePicture = String(profilePicture).trim();

    const response = yield call(connectedAccountsApi.connectAccount, safePayload);
    const account = response?.data?.data?.account;
    const message = response?.data?.message || 'Mock account connected successfully.';

    yield put(connectAccountSuccess({ account, message }));
  } catch (error) {
    if (error?.response?.status === 409) {
      yield put(connectAccountFailure('This account is already connected.'));
      return;
    }

    const normalized = normalizeApiError(error);
    yield put(connectAccountFailure(normalized.message || 'Failed to connect account.'));
  }
}

export function* disconnectAccountWorker(action) {
  const accountId = action.payload;
  try {
    const response = yield call(connectedAccountsApi.disconnectAccount, accountId);
    const message = response?.data?.message || 'Mock account removed successfully.';

    yield put(disconnectAccountSuccess({ accountId, message }));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(disconnectAccountFailure(normalized.message || 'Failed to disconnect account.'));
  }
}

export function* connectedAccountsSaga() {
  yield all([
    takeLatest(fetchConnectedAccountsRequest.type, fetchConnectedAccountsWorker),
    takeLatest(connectAccountRequest.type, connectAccountWorker),
    takeLatest(disconnectAccountRequest.type, disconnectAccountWorker),
  ]);
}

export default connectedAccountsSaga;
