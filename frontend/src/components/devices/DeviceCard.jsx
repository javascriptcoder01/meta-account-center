import React from 'react';
import DeviceIcon from './DeviceIcon.jsx';
import CurrentDeviceBadge from './CurrentDeviceBadge.jsx';
import DeviceMetadata from './DeviceMetadata.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const DeviceCard = ({
  device,
  isCurrentDevice = false,
  onRevoke,
  isRevoking = false,
}) => {
  const {
    deviceName,
    browser,
    browserVersion,
    operatingSystem,
    ipAddress,
    loginAt,
    lastActivityAt,
  } = device || {};

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <DeviceIcon deviceName={deviceName} operatingSystem={operatingSystem} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">
                {deviceName || 'Unknown Device'}
              </h2>
              {isCurrentDevice && <CurrentDeviceBadge />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {[browser, operatingSystem].filter(Boolean).join(' on ')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRevoke(device)}
          disabled={isRevoking}
          aria-label={`Sign out ${deviceName || 'device'}`}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5 ${
            isCurrentDevice
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isRevoking ? (
            <LoadingSpinner size="sm" color={isCurrentDevice ? 'text-rose-600' : 'text-slate-600'} />
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{isCurrentDevice ? 'Sign Out Current Session' : 'Sign Out Device'}</span>
            </>
          )}
        </button>
      </div>

      <DeviceMetadata
        browser={browser}
        browserVersion={browserVersion}
        operatingSystem={operatingSystem}
        ipAddress={ipAddress}
        loginAt={loginAt}
        lastActivityAt={lastActivityAt}
      />
    </div>
  );
};

export default DeviceCard;
