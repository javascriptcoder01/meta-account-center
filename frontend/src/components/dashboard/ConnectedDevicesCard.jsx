import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import DashboardEmptyState from './DashboardEmptyState.jsx';

export const ConnectedDevicesCard = ({ connectedDevices }) => {
  const devices = Array.isArray(connectedDevices) ? connectedDevices : [];

  const formatDeviceDate = (isoString) => {
    if (!isoString) return 'Active now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Active now';
    }
  };

  const getDeviceIcon = (os = '') => {
    const osLower = os.toLowerCase();
    if (osLower.includes('ios') || osLower.includes('android') || osLower.includes('phone')) {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-base font-semibold text-slate-900">Connected Devices</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Where you're logged in</span>
        </div>

        {devices.length === 0 ? (
          <DashboardEmptyState
            message="No active devices"
            description="Your active sessions across computers, tablets, and phones will appear here."
          />
        ) : (
          <ul className="divide-y divide-slate-100 my-2">
            {devices.map((device, index) => {
              const browserLabel = device.browserVersion
                ? `${device.browser} ${device.browserVersion}`
                : device.browser;

              return (
                <li key={device.id || device.sessionId || index} className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    {getDeviceIcon(device.operatingSystem)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{device.deviceName}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDeviceDate(device.lastActivityAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {device.operatingSystem} • {browserLabel}
                    </p>
                    {device.ipAddress && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        IP: {device.ipAddress}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          to={ROUTES.DEVICES}
          className="w-full inline-flex items-center justify-center py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
        >
          View Devices
        </Link>
      </div>
    </div>
  );
};

export default ConnectedDevicesCard;
