import { call, put, takeLatest, all } from 'redux-saga/effects';
import profileApi from '../../api/profileApi.js';
import normalizeApiError from '../../api/apiError.js';
import { clearAuth } from '../slices/authSlice.js';
import {
  fetchProfileRequest,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
  changeEmailRequest,
  changeEmailSuccess,
  changeEmailFailure,
  changePhoneRequest,
  changePhoneSuccess,
  changePhoneFailure,
  changeProfilePictureRequest,
  changeProfilePictureSuccess,
  changeProfilePictureFailure,
} from '../slices/profileSlice.js';

export function* fetchProfileSaga() {
  try {
    const response = yield call(profileApi.getProfile);
    const user = response?.data?.data?.user || response?.data?.data;
    yield put(fetchProfileSuccess(user));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(fetchProfileFailure(normalized.message || 'Unable to load profile.'));
  }
}

export function* updateProfileSaga(action) {
  try {
    const { firstName, lastName, dateOfBirth, profilePicture } = action.payload || {};
    const safePayload = {};

    if (firstName !== undefined) safePayload.firstName = typeof firstName === 'string' ? firstName.trim() : '';
    if (lastName !== undefined) safePayload.lastName = typeof lastName === 'string' ? lastName.trim() : '';
    if (dateOfBirth !== undefined) safePayload.dateOfBirth = dateOfBirth || null;
    if (profilePicture !== undefined) safePayload.profilePicture = profilePicture || null;

    const response = yield call(profileApi.updateProfile, safePayload);
    const user = response?.data?.data?.user;
    const message = response?.data?.message || 'Profile updated successfully.';

    yield put(updateProfileSuccess({ user, message }));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(updateProfileFailure(normalized.message || 'Failed to update profile.'));
  }
}

export function* changePasswordSaga(action) {
  try {
    const { currentPassword, newPassword, confirmPassword } = action.payload || {};
    const response = yield call(profileApi.changePassword, {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    const message = response?.data?.message || 'Password changed successfully. Please log in again.';
    yield put(changePasswordSuccess({ message }));
    yield put(clearAuth());
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(changePasswordFailure(normalized.message || 'Failed to change password.'));
  }
}

export function* changeEmailSaga(action) {
  try {
    const { email } = action.payload || {};
    const response = yield call(profileApi.changeEmail, {
      email: typeof email === 'string' ? email.trim() : '',
    });

    const message = response?.data?.message || 'Email address updated successfully. Please log in again.';
    yield put(changeEmailSuccess({ message }));
    yield put(clearAuth());
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(changeEmailFailure(normalized.message || 'Failed to update email address.'));
  }
}

export function* changePhoneSaga(action) {
  try {
    const { phone } = action.payload || {};
    const safePhone = phone ? String(phone).trim() : null;

    const response = yield call(profileApi.changePhone, { phone: safePhone });
    const user = response?.data?.data?.user;
    const message = response?.data?.message || 'Phone number updated successfully.';

    yield put(changePhoneSuccess({ user, message }));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(changePhoneFailure(normalized.message || 'Failed to update phone number.'));
  }
}

export function* changeProfilePictureSaga(action) {
  try {
    const { profilePicture } = action.payload || {};
    const safeUrl = profilePicture ? String(profilePicture).trim() : null;

    const response = yield call(profileApi.changeProfilePicture, { profilePicture: safeUrl });
    const user = response?.data?.data?.user;
    const message = response?.data?.message || 'Profile picture updated successfully.';

    yield put(changeProfilePictureSuccess({ user, message }));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(changeProfilePictureFailure(normalized.message || 'Failed to update profile picture.'));
  }
}

export function* profileSaga() {
  yield all([
    takeLatest(fetchProfileRequest.type, fetchProfileSaga),
    takeLatest(updateProfileRequest.type, updateProfileSaga),
    takeLatest(changePasswordRequest.type, changePasswordSaga),
    takeLatest(changeEmailRequest.type, changeEmailSaga),
    takeLatest(changePhoneRequest.type, changePhoneSaga),
    takeLatest(changeProfilePictureRequest.type, changeProfilePictureSaga),
  ]);
}

export default profileSaga;
