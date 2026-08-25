import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';

export const SecurityStatusCard = ({ securityStatus }) => {
  const is2FAEnabled = Boolean(securityStatus?.twoFactorEnabled);
  const rawMethod = securityStatus?.twoFactorMethod;
  const activeDeviceCount = securityStatus?.activeDeviceCount ?? 0;

  const getMethodLabel = (method) => {
    switch (method) {
      case 'SMS':
        return 'SMS Text Message';
      case 'AUTHENTICATOR_APP':
        return 'Authenticator App';
      case 'EMAIL':
        return 'Email Verification';
      default:
        return 'Not configured';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-base font-semibold text-slate-900">Security Status</h2>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${is2FAEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
          >
            {is2FAEnabled ? 'Protected' : 'Action Recommended'}
          </span>
        </div>

        <div className="space-y-3.5 my-4">

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Two-Factor Authentication</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </p>
              {is2FAEnabled && rawMethod && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Method: <span className="font-medium text-slate-600">{getMethodLabel(rawMethod)}</span>
                </p>
              )}
            </div>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}
            >
              {is2FAEnabled ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Signed-in Sessions</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {activeDeviceCount} {activeDeviceCount === 1 ? 'device' : 'devices'}
              </p>
            </div>
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          to={ROUTES.SECURITY}
          className="w-full inline-flex items-center justify-center py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
        >
          Security Settings
        </Link>
      </div>
    </div>
  );
};

export default SecurityStatusCard;
