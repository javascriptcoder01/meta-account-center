import React from 'react';

export const PasswordChangedInfo = ({ lastPasswordChangedAt = null }) => {
  const formattedDate = lastPasswordChangedAt
    ? new Date(lastPasswordChangedAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-slate-900">Password Change History</h3>
        <p className="text-xs text-slate-500">
          {formattedDate
            ? `Last password update: ${formattedDate}`
            : 'Password change history is not available.'}
        </p>
      </div>
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
        Read-only
      </span>
    </div>
  );
};

export default PasswordChangedInfo;
