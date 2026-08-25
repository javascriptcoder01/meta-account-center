import React, { useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const RevokeDeviceModal = ({
  isOpen = false,
  device = null,
  isCurrentDevice = false,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !device) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-device-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCurrentDevice
                ? 'bg-rose-100 text-rose-600 border border-rose-200'
                : 'bg-amber-100 text-amber-600 border border-amber-200'
              }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <h2 id="revoke-device-title" className="text-lg font-bold text-slate-900">
              Sign out this device?
            </h2>
            <p className="text-xs text-slate-500">
              {device.deviceName || 'Device'} &middot;{' '}
              {[device.browser, device.operatingSystem].filter(Boolean).join(' on ')}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {isCurrentDevice
            ? 'This is your current device. Signing it out will end your current session and return you to the login screen.'
            : 'This device will no longer be able to access your account. To use it again, you will need to sign in with your credentials.'}
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(device.sessionId)}
            disabled={isLoading}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${isCurrentDevice
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 shadow-sm'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-sm'
              }`}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="text-white" label="Signing out..." />
            ) : (
              <span>{isCurrentDevice ? 'Sign out and continue' : 'Sign out device'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevokeDeviceModal;
