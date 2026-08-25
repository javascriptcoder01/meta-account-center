import React from 'react';

export const ActivityMetadata = ({ metadata }) => {
  if (!metadata || typeof metadata !== 'object' || Object.keys(metadata).length === 0) {
    return null;
  }

  const SENSITIVE_KEYS = new Set([
    'token',
    'secret',
    'password',
    'passwordhash',
    'refreshtoken',
    'refreshtokenhash',
    'resettoken',
    'tokenhash',
    'accesstoken',
    'jwt',
    'cookie',
  ]);

  const safeEntries = Object.entries(metadata).filter(
    ([k, v]) =>
      !SENSITIVE_KEYS.has(k.toLowerCase()) &&
      v !== null &&
      v !== undefined &&
      typeof v !== 'function'
  );

  if (safeEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {safeEntries.map(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return (
          <span
            key={key}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
          >
            <span className="font-semibold text-slate-500 mr-1">{key}:</span>
            <span className="truncate max-w-xs">{displayValue}</span>
          </span>
        );
      })}
    </div>
  );
};

export default ActivityMetadata;
