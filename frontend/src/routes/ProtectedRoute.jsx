import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import ROUTES from '../constants/routes.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

/**
 * Route wrapper that enforces authentication.
 * If authentication is initializing, displays full-screen session check splash.
 * If unauthenticated, redirects to /login preserving intended destination in state.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isInitializing) {
    return (
      <div
        data-testid="auth-loading-splash"
        className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4"
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Meta Accounts Center</h2>
          <p className="text-sm text-slate-500">Checking secure session...</p>
          <LoadingSpinner size="lg" color="text-blue-600" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
