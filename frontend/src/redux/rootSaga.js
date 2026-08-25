import { all, fork } from 'redux-saga/effects';
import authSaga from './sagas/authSaga.js';
import dashboardSaga from './sagas/dashboardSaga.js';
import profileSaga from './sagas/profileSaga.js';
import connectedAccountsSaga from './sagas/connectedAccountsSaga.js';
import privacySaga from './sagas/privacySaga.js';
import securitySettingsSaga from './sagas/securitySettingsSaga.js';
import activityLogSaga from './sagas/activityLogSaga.js';
import deviceSaga from './sagas/deviceSaga.js';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(dashboardSaga),
    fork(profileSaga),
    fork(connectedAccountsSaga),
    fork(privacySaga),
    fork(securitySettingsSaga),
    fork(activityLogSaga),
    fork(deviceSaga),
  ]);
}
