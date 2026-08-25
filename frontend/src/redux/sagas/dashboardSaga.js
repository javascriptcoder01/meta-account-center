import { call, put, takeLatest, all } from 'redux-saga/effects';
import dashboardApi from '../../api/dashboardApi.js';
import normalizeApiError from '../../api/apiError.js';
import {
  fetchDashboardRequest,
  fetchDashboardSuccess,
  fetchDashboardFailure,
} from '../slices/dashboardSlice.js';

export function* fetchDashboardSaga() {
  try {
    const response = yield call(dashboardApi.getDashboard);
    const data = response?.data?.data;
    yield put(fetchDashboardSuccess(data));
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(fetchDashboardFailure(normalized.message || 'Unable to load your dashboard.'));
  }
}

export function* dashboardSaga() {
  yield all([
    takeLatest(fetchDashboardRequest.type, fetchDashboardSaga),
  ]);
}

export default dashboardSaga;
