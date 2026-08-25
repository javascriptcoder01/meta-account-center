import React from 'react';
import ActivityIcon from './ActivityIcon.jsx';
import ActivityMetadata from './ActivityMetadata.jsx';
import formatActivityDate from '../../utils/dateFormatter.js';

export const ActivityItem = ({ log }) => {
  const {
    action,
    category,
    description,
    deviceName,
    browser,
    operatingSystem,
    ipAddress,
    metadata,
    createdAt,
  } = log || {};

  const deviceParts = [deviceName, browser, operatingSystem].filter(Boolean);
  const formattedTime = formatActivityDate(createdAt);

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <ActivityIcon action={action} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">{action || 'Activity Event'}</h2>
              {category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {category}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        <time
          dateTime={createdAt || undefined}
          className="text-[11px] font-medium text-slate-500 shrink-0 mt-0.5"
        >
          {formattedTime}
        </time>
      </div>

      {(deviceParts.length > 0 || ipAddress) && (
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          {deviceParts.length > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{deviceParts.join(' · ')}</span>
            </div>
          )}

          {ipAddress && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>IP: {ipAddress}</span>
            </div>
          )}
        </div>
      )}

      <ActivityMetadata metadata={metadata} />
    </div>
  );
};

export default ActivityItem;
