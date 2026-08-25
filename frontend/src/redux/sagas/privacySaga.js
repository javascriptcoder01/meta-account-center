import { call, put, takeLatest, all } from 'redux-saga/effects';
import privacyApi from '../../api/privacyApi.js';
import normalizeApiError from '../../api/apiError.js';
import {
  fetchPrivacyRequest,
  fetchPrivacySuccess,
  fetchPrivacyFailure,
  updatePrivacyRequest,
  updatePrivacySuccess,
  updatePrivacyFailure,
} from '../slices/privacySlice.js';
import { ALLOWED_VISIBILITIES } from '../../constants/settingsConstants.js';

export function* fetchPrivacySettingsWorker() {
  try {
    const response = yield call(privacyApi.getPrivacySettings);
    const data = response?.data?.data?.privacySettings || response?.data?.data;
    yield put(fetchPrivacySuccess(data));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(fetchPrivacyFailure(normalized.message || 'Unable to load privacy settings.'));
  }
}

export function* updatePrivacySettingsWorker(action) {
  try {
    const {
      profileVisibility,
      emailVisibility,
      phoneVisibility,
      personalizedAds,
      dataSharing,
    } = action.payload || {};

    const safePayload = {};

    if (profileVisibility && ALLOWED_VISIBILITIES.includes(profileVisibility.toUpperCase())) {
      safePayload.profileVisibility = profileVisibility.toUpperCase();
    }
    if (emailVisibility && ALLOWED_VISIBILITIES.includes(emailVisibility.toUpperCase())) {
      safePayload.emailVisibility = emailVisibility.toUpperCase();
    }
    if (phoneVisibility && ALLOWED_VISIBILITIES.includes(phoneVisibility.toUpperCase())) {
      safePayload.phoneVisibility = phoneVisibility.toUpperCase();
    }
    if (typeof personalizedAds === 'boolean') {
      safePayload.personalizedAds = personalizedAds;
    }
    if (typeof dataSharing === 'boolean') {
      safePayload.dataSharing = dataSharing;
    }

    const response = yield call(privacyApi.updatePrivacySettings, safePayload);
    const settings = response?.data?.data?.privacySettings || response?.data?.data;
    const message = response?.data?.message || 'Privacy settings updated successfully.';

    yield put(updatePrivacySuccess({ settings, message }));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(updatePrivacyFailure(normalized.message || 'Failed to update privacy settings.'));
  }
}

export function* privacySaga() {
  yield all([
    takeLatest(fetchPrivacyRequest.type, fetchPrivacySettingsWorker),
    takeLatest(updatePrivacyRequest.type, updatePrivacySettingsWorker),
  ]);
}

export default privacySaga;
