import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardRequest } from '../../redux/slices/dashboardSlice.js';
import DashboardHeader from '../../components/dashboard/DashboardHeader.jsx';
import ProfileSummaryCard from '../../components/dashboard/ProfileSummaryCard.jsx';
import ConnectedAccountsCard from '../../components/dashboard/ConnectedAccountsCard.jsx';
import SecurityStatusCard from '../../components/dashboard/SecurityStatusCard.jsx';
import RecentActivitiesCard from '../../components/dashboard/RecentActivitiesCard.jsx';
import ConnectedDevicesCard from '../../components/dashboard/ConnectedDevicesCard.jsx';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton.jsx';
import Alert from '../../components/common/Alert.jsx';

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error, loaded } = useSelector((state) => state.dashboard);
  const authUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchDashboardRequest());
    }
  }, [dispatch, loaded]);

  const handleRetry = () => {
    dispatch(fetchDashboardRequest());
  };

  // Profile data fallback to auth user if dashboard data is still partial
  const profile = data?.profile || authUser || {};

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Alert on partial/subsequent fetch failure */}
        {error && data && (
          <Alert
            type="error"
            message="Unable to refresh latest dashboard data. Displaying cached information."
          />
        )}

        {/* Initial Loading State */}
        {isLoading && !data && <DashboardSkeleton />}

        {/* Full Error State (no data available) */}
        {!isLoading && !data && error && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Unable to load your dashboard.</h2>
            <p className="text-sm text-slate-500">
              {typeof error === 'string' ? error : 'Something went wrong while retrieving your account overview.'}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Successful Dashboard Render */}
        {data && (
          <>
            <DashboardHeader profile={profile} />

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <ProfileSummaryCard profile={data.profile} />

              {/* Connected Accounts Card */}
              <ConnectedAccountsCard connectedAccounts={data.connectedAccounts} />

              {/* Security Status Card */}
              <SecurityStatusCard securityStatus={data.securityStatus} />

              {/* Recent Activities (span 2 cols on lg) */}
              <div className="md:col-span-2 lg:col-span-2">
                <RecentActivitiesCard recentActivities={data.recentActivities} />
              </div>

              {/* Connected Devices (span 1 col on lg) */}
              <div className="md:col-span-2 lg:col-span-1">
                <ConnectedDevicesCard connectedDevices={data.connectedDevices} />
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
