import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './redux/store.js';
import { initializeAuthRequest } from './redux/slices/authSlice.js';
import AppRoutes from './routes/AppRoutes.jsx';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuthRequest());
  }, [dispatch]);

  return <AppRoutes />;
};

export const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
