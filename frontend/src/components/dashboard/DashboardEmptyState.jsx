import React from 'react';

export const DashboardEmptyState = ({
  icon,
  message = 'No data available',
  description,
  className = '',
}) => {
  return (
    <div className={`py-6 px-4 text-center flex flex-col items-center justify-center ${className}`}>
      {icon ? (
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
          {icon}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <p className="text-sm font-medium text-slate-600">{message}</p>
      {description && <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>}
    </div>
  );
};

export default DashboardEmptyState;
