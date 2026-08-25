import React from 'react';
import { ACTIVITY_CATEGORIES } from '../../constants/activityConstants.js';

export const ActivityCategoryFilter = ({ selectedCategory = null, onSelectCategory, disabled = false }) => {
  const filterOptions = [
    { label: 'All Activity', value: null },
    { label: 'Authentication', value: ACTIVITY_CATEGORIES.AUTHENTICATION },
    { label: 'Sessions', value: ACTIVITY_CATEGORIES.SESSION },
    { label: 'Profile', value: ACTIVITY_CATEGORIES.PROFILE },
    { label: 'Connected Accounts', value: ACTIVITY_CATEGORIES.CONNECTED_ACCOUNT },
    { label: 'Security', value: ACTIVITY_CATEGORIES.SECURITY },
    { label: 'Privacy', value: ACTIVITY_CATEGORIES.PRIVACY },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter activity by category"
      className="flex flex-wrap gap-2 py-1 overflow-x-auto no-scrollbar"
    >
      {filterOptions.map((opt) => {
        const isSelected = selectedCategory === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => onSelectCategory(opt.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSelected
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default ActivityCategoryFilter;
