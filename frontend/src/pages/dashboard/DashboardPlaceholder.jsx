import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutRequest, logoutAllRequest } from '../../redux/slices/authSlice.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const DashboardPlaceholder = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutRequest());
  };

  const handleLogoutAll = () => {
    dispatch(logoutAllRequest());
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 border border-slate-200 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.firstName || 'User'}!
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {user?.email || 'Authenticated User'}
        </p>

        <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200 mb-6 space-y-2 text-xs text-slate-600">
          <div><span className="font-semibold">Role:</span> {user?.role || 'user'}</div>
          <div><span className="font-semibold">2FA Enabled:</span> {user?.isTwoFactorEnabled ? 'Yes' : 'No'}</div>
          <div><span className="font-semibold">Status:</span> Protected Dashboard (Batch 4.1 Verified)</div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : 'Log Out'}
          </button>
          <button
            type="button"
            onClick={handleLogoutAll}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : 'Log Out All Devices'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;
