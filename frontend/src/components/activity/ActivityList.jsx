import React from 'react';
import ActivityItem from './ActivityItem.jsx';
import ActivityEmptyState from './ActivityEmptyState.jsx';
import ActivityPagination from './ActivityPagination.jsx';

export const ActivityList = ({
  logs = [],
  pagination,
  selectedCategory,
  onPageChange,
  onClearFilter,
  isLoading = false,
}) => {
  if (!logs || logs.length === 0) {
    return (
      <ActivityEmptyState
        selectedCategory={selectedCategory}
        onClearFilter={onClearFilter}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {logs.map((log) => (
          <ActivityItem key={log.id || `${log.action}-${log.createdAt}`} log={log} />
        ))}
      </div>

      <ActivityPagination
        pagination={pagination}
        onPageChange={onPageChange}
        disabled={isLoading}
      />
    </div>
  );
};

export default ActivityList;
