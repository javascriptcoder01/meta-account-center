import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import DashboardEmptyState from './DashboardEmptyState.jsx';

export const RecentActivitiesCard = ({ recentActivities }) => {
  const activities = Array.isArray(recentActivities) ? recentActivities : [];

  const formatActivityDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category?.toUpperCase()) {
      case 'AUTH':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SECURITY':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PROFILE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONNECTED_ACCOUNT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-base font-semibold text-slate-900">Recent Activities</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Last 5 events</span>
        </div>

        {activities.length === 0 ? (
          <DashboardEmptyState
            message="No recent activity"
            description="Your security and account actions (such as logins and password changes) will appear here."
          />
        ) : (
          <ul className="divide-y divide-slate-100 my-2">
            {activities.map((act, index) => (
              <li key={act.id || index} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                        act.category
                      )}`}
                    >
                      {act.category || 'General'}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 truncate">{act.action}</p>
                  </div>
                  {act.description && (
                    <p className="text-xs text-slate-500 leading-snug break-words">
                      {act.description}
                    </p>
                  )}
                </div>
                <time className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                  {formatActivityDate(act.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          to={ROUTES.ACTIVITY}
          className="w-full inline-flex items-center justify-center py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
        >
          View Activity History
        </Link>
      </div>
    </div>
  );
};

export default RecentActivitiesCard;
