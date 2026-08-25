import React from 'react';

export const ActivityEmptyState = ({ selectedCategory = null, onClearFilter }) => {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-base font-bold text-slate-900">
        {selectedCategory ? 'No activity found in this category' : 'No activity yet'}
      </h3>

      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
        {selectedCategory
          ? 'There are no recorded events for the selected category. Try selecting another category or viewing all activity.'
          : 'Your recent account activity, logins, and security events will appear here.'}
      </p>

      {selectedCategory && onClearFilter && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onClearFilter}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityEmptyState;
