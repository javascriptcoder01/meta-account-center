import { call, put, takeLatest, all } from 'redux-saga/effects';
import securitySettingsApi from '../../api/securitySettingsApi.js';
import normalizeApiError from '../../api/apiError.js';
import { clearAuth } from '../slices/authSlice.js';
import {
  fetchSecuritySettingsRequest,
  fetchSecuritySettingsSuccess,
  fetchSecuritySettingsFailure,
  updateSecuritySettingsRequest,
  updateSecuritySettingsSuccess,
  updateSecuritySettingsFailure,
} from '../slices/securitySettingsSlice.js';
import { ALLOWED_TWO_FACTOR_METHODS } from '../../constants/settingsConstants.js';


export function* fetchSecuritySettingsWorker() {
  try {
    const response = yield call(securitySettingsApi.getSecuritySettings);
    const data = response?.data?.data?.securitySettings || response?.data?.data;
    yield put(fetchSecuritySettingsSuccess(data));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(
      fetchSecuritySettingsFailure(normalized.message || 'Unable to load security settings.')
    );
  }
}

export function* updateSecuritySettingsWorker(action) {
  try {
    const { twoFactorEnabled, twoFactorMethod } = action.payload || {};

    const isEnabled = Boolean(twoFactorEnabled);
    let safeMethod = null;

    if (!isEnabled) {
      if (twoFactorMethod !== null && twoFactorMethod !== undefined) {
        yield put(
          updateSecuritySettingsFailure('Two-factor method must be null when 2FA is disabled.')
        );
        return;
      }
      safeMethod = null;
    } else {
      const upperMethod = typeof twoFactorMethod === 'string' ? twoFactorMethod.toUpperCase() : '';
      if (!upperMethod || !ALLOWED_TWO_FACTOR_METHODS.includes(upperMethod)) {
        yield put(
          updateSecuritySettingsFailure(
            'A valid two-factor method (SMS, Authenticator App, or Email) is required when 2FA is enabled.'
          )
        );
        return;
      }
      safeMethod = upperMethod;
    }

    const safePayload = {
      twoFactorEnabled: isEnabled,
      twoFactorMethod: safeMethod,
    };

    const response = yield call(securitySettingsApi.updateSecuritySettings, safePayload);
    const settings = response?.data?.data?.securitySettings || response?.data?.data;
    const message =
      response?.data?.message ||
      'Security settings updated. All active sessions were signed out. Please log in again.';

    yield put(updateSecuritySettingsSuccess({ settings, message }));
    yield put(clearAuth());
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(updateSecuritySettingsFailure(normalized.message || 'Failed to update security settings.'));
  }
}

export function* securitySettingsSaga() {
  yield all([
    takeLatest(fetchSecuritySettingsRequest.type, fetchSecuritySettingsWorker),
    takeLatest(updateSecuritySettingsRequest.type, updateSecuritySettingsWorker),
  ]);
}

export default securitySettingsSaga;
