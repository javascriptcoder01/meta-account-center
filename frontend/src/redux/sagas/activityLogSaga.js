import { call, put, select, takeLatest, all } from 'redux-saga/effects';
import activityLogApi from '../../api/activityLogApi.js';
import normalizeApiError from '../../api/apiError.js';
import {
  fetchActivityLogsRequest,
  fetchActivityLogsSuccess,
  fetchActivityLogsFailure,
  setActivityCategory,
  setActivityPage,
} from '../slices/activityLogSlice.js';

export const selectActivityLogState = (state) => state.activityLog;

export function* fetchActivityLogsWorker(action) {
  try {
    const activityState = yield select(selectActivityLogState);
    const page = action?.payload?.page ?? activityState?.pagination?.page ?? 1;
    const limit = action?.payload?.limit ?? activityState?.pagination?.limit ?? 20;
    const category =
      action?.payload?.category !== undefined
        ? action.payload.category
        : activityState?.selectedCategory;

    const response = yield call(activityLogApi.getActivityLogs, {
      page,
      limit,
      category: category || undefined,
    });

    const data = response?.data?.data || {};
    yield put(
      fetchActivityLogsSuccess({
        logs: data.logs || [],
        pagination: data.pagination || {
          total: (data.logs || []).length,
          page,
          limit,
          pages: 1,
        },
      })
    );
  } catch (error) {
    const normalized = normalizeApiError(error);
    yield put(
      fetchActivityLogsFailure(normalized.message || 'Unable to load activity history.')
    );
  }
}

export function* activityLogSaga() {
  yield all([
    takeLatest(fetchActivityLogsRequest.type, fetchActivityLogsWorker),
    takeLatest(setActivityCategory.type, fetchActivityLogsWorker),
    takeLatest(setActivityPage.type, fetchActivityLogsWorker),
  ]);
}

export default activityLogSaga;
