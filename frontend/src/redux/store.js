import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer.js';
import rootSaga from './rootSaga.js';
import { injectStore } from '../api/apiClient.js';
import { clearAuth } from './slices/authSlice.js';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        warnAfter: 128,
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});


sagaMiddleware.run(rootSaga);

injectStore(store.dispatch, () => {
  store.dispatch(clearAuth());
});

export default store;
