import React from 'react';
import formatActivityDate from '../../utils/dateFormatter.js';

export const DeviceMetadata = ({
  browser,
  browserVersion,
  operatingSystem,
  ipAddress,
  loginAt,
  lastActivityAt,
}) => {
  const browserDisplay = [browser, browserVersion].filter(Boolean).join(' ');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
      {browserDisplay && (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-400">Browser:</span>
          <span className="font-semibold text-slate-700">{browserDisplay}</span>
        </div>
      )}

      {operatingSystem && (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-400">System:</span>
          <span className="font-semibold text-slate-700">{operatingSystem}</span>
        </div>
      )}

      {lastActivityAt && (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-400">Last active:</span>
          <span className="font-semibold text-slate-700">{formatActivityDate(lastActivityAt)}</span>
        </div>
      )}

      {loginAt && (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-400">Signed in:</span>
          <span className="font-semibold text-slate-700">{formatActivityDate(loginAt)}</span>
        </div>
      )}

      {ipAddress && (
        <div className="flex items-center gap-1.5 sm:col-span-2">
          <span className="font-medium text-slate-400">IP address:</span>
          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
            {ipAddress}
          </span>
        </div>
      )}
    </div>
  );
};

export default DeviceMetadata;
