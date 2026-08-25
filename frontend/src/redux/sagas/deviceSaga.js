import { call, put, select, takeLatest, all } from 'redux-saga/effects';
import deviceApi from '../../api/deviceApi.js';
import normalizeApiError from '../../api/apiError.js';
import { clearAuth } from '../slices/authSlice.js';
import {
  fetchDevicesRequest,
  fetchDevicesSuccess,
  fetchDevicesFailure,
  revokeDeviceRequest,
  revokeDeviceSuccess,
  revokeDeviceFailure,
} from '../slices/deviceSlice.js';
import { parseJwtSessionId } from '../../utils/tokenUtils.js';

export const selectAuthToken = (state) => state.auth?.accessToken;

export function* fetchDevicesWorker() {
  try {
    const response = yield call(deviceApi.getDevices);
    const devices = response?.data?.data?.devices || response?.data?.data || [];
    yield put(fetchDevicesSuccess(devices));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(
      fetchDevicesFailure(normalized.message || 'Unable to load active devices.')
    );
  }
}

export function* revokeDeviceWorker(action) {
  const sessionId = action.payload;
  try {
    const token = yield select(selectAuthToken);
    const currentSessionId = parseJwtSessionId(token);
    const isCurrentSession = Boolean(currentSessionId && currentSessionId === sessionId);

    const response = yield call(deviceApi.revokeDevice, sessionId);
    const message = response?.data?.message || 'Device signed out successfully.';

    yield put(revokeDeviceSuccess({ sessionId, message }));

    if (isCurrentSession) {
      yield put(clearAuth());
    }
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(
      revokeDeviceFailure(normalized.message || 'Unable to sign out this device.')
    );
  }
}

export function* deviceSaga() {
  yield all([
    takeLatest(fetchDevicesRequest.type, fetchDevicesWorker),
    takeLatest(revokeDeviceRequest.type, revokeDeviceWorker),
  ]);
}

export default deviceSaga;
