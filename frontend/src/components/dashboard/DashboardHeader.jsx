import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import { logoutRequest } from '../../redux/slices/authSlice.js';
import { fetchDashboardRequest } from '../../redux/slices/dashboardSlice.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const DashboardHeader = ({ profile }) => {
  const dispatch = useDispatch();
  const authLoading = useSelector((state) => state.auth.isLoading);
  const dashboardLoading = useSelector((state) => state.dashboard.isLoading);

  const handleLogout = () => {
    dispatch(logoutRequest());
  };

  const handleRefresh = () => {
    dispatch(fetchDashboardRequest());
  };

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : 'Account Holder';

  return (
    <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Branding & Greeting */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 text-white flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Meta Accounts Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Welcome, {displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your connected experiences, personal details, and account security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={dashboardLoading}
            aria-label="Refresh dashboard data"
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Refresh dashboard"
          >
            {dashboardLoading ? (
              <LoadingSpinner size="sm" color="text-slate-600" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={authLoading}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {authLoading ? (
              <LoadingSpinner size="sm" color="text-white" label="Logging out..." />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>

      <nav className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs sm:text-sm font-medium text-slate-600 scrollbar-none">
        <span className="text-slate-400 font-normal pr-1">Jump to:</span>
        <Link
          to={ROUTES.PROFILE}
          className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
        >
          Profile
        </Link>
        <Link
          to={ROUTES.CONNECTED_ACCOUNTS}
          className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
        >
          Connected Accounts
        </Link>
        <Link
          to={ROUTES.SECURITY}
          className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
        >
          Security
        </Link>
        <Link
          to={ROUTES.ACTIVITY}
          className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
        >
          Activity History
        </Link>
        <Link
          to={ROUTES.DEVICES}
          className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
        >
          Devices
        </Link>
      </nav>
    </header>
  );
};

export default DashboardHeader;
