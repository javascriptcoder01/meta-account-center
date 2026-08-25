import React from 'react';

export const DeviceEmptyState = () => {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h3 className="text-base font-bold text-slate-900">
        No active devices
      </h3>

      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
        Active sessions will appear here when you sign in from a device.
      </p>
    </div>
  );
};

export default DeviceEmptyState;
