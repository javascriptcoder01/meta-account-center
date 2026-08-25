import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from '../constants/routes.js';

// Route Guards
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';

// Auth Pages (Batch 4.1 Scope)
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';

// Dashboard (Batch 4.2 Scope)
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';

// Profile (Batch 4.3 Scope)
import ProfilePage from '../pages/profile/ProfilePage.jsx';

// Connected Accounts (Batch 4.4 Scope)
import ConnectedAccountsPage from '../pages/connectedAccounts/ConnectedAccountsPage.jsx';

// Privacy & Security (Batch 4.5 Scope)
import PrivacySettingsPage from '../pages/settings/PrivacySettingsPage.jsx';
import SecuritySettingsPage from '../pages/settings/SecuritySettingsPage.jsx';

// Activity History (Batch 4.6 Scope)
import ActivityHistoryPage from '../pages/activity/ActivityHistoryPage.jsx';

// Device Management (Batch 4.7 Scope)
import DeviceManagementPage from '../pages/devices/DeviceManagementPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* Public Authentication Routes */}
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.PRIVACY} element={<PrivacySettingsPage />} />
        <Route path={ROUTES.SECURITY} element={<SecuritySettingsPage />} />
        <Route
          path={ROUTES.CONNECTED_ACCOUNTS}
          element={<ConnectedAccountsPage />}
        />
        <Route
          path={ROUTES.ACTIVITY}
          element={<ActivityHistoryPage />}
        />
        <Route
          path={ROUTES.DEVICES}
          element={<DeviceManagementPage />}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
