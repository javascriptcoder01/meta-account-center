import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchActivityLogsRequest,
  setActivityCategory,
  setActivityPage,
  clearActivityError,
} from '../../redux/slices/activityLogSlice.js';
import ActivityHistoryHeader from '../../components/activity/ActivityHistoryHeader.jsx';
import ActivityCategoryFilter from '../../components/activity/ActivityCategoryFilter.jsx';
import ActivityList from '../../components/activity/ActivityList.jsx';
import Alert from '../../components/common/Alert.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const ActivityHistoryPage = () => {
  const dispatch = useDispatch();
  const { logs, pagination, selectedCategory, isLoading, error, loaded } = useSelector(
    (state) => state.activityLog
  );

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchActivityLogsRequest());
    }
    return () => {
      dispatch(clearActivityError());
    };
  }, [dispatch, loaded]);

  const handleRefresh = () => {
    dispatch(fetchActivityLogsRequest({ page: pagination.page, category: selectedCategory }));
  };

  const handleCategorySelect = (category) => {
    dispatch(setActivityCategory(category));
  };

  const handlePageChange = (newPage) => {
    dispatch(setActivityPage(newPage));
  };

  const handleRetry = () => {
    dispatch(fetchActivityLogsRequest({ page: pagination.page, category: selectedCategory }));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="space-y-2">
            <Alert
              type="error"
              message={typeof error === 'string' ? error : error?.message || 'Failed to load activity history'}
              onClose={() => dispatch(clearActivityError())}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <ActivityHistoryHeader
          totalCount={pagination.total}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Category Filter */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <ActivityCategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            disabled={isLoading}
          />
        </div>

        {/* Initial Loading Skeleton */}
        {isLoading && !loaded && (
          <div data-testid="activity-loading-skeleton" className="space-y-3 animate-pulse">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-24 flex items-center justify-center">
              <LoadingSpinner size="lg" color="text-indigo-600" label="Loading activity logs..." />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-24" />
            <div className="bg-white rounded-2xl p-6 border border-slate-200 h-24" />
          </div>
        )}

        {/* Activity List & Pagination */}
        {(!isLoading || loaded) && (
          <ActivityList
            logs={logs}
            pagination={pagination}
            selectedCategory={selectedCategory}
            onPageChange={handlePageChange}
            onClearFilter={() => handleCategorySelect(null)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityHistoryPage;
