import React from 'react';

export const TwoFactorToggle = ({
  checked = false,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="space-y-0.5">
        <label htmlFor="twoFactorToggle" className="text-sm font-bold text-slate-900 block cursor-pointer">
          Two-Factor Authentication Status
        </label>
        <p className="text-xs text-slate-500">
          {checked
            ? 'Two-factor authentication is currently enabled for your account.'
            : 'Two-factor authentication is currently disabled.'}
        </p>
      </div>

      <button
        id="twoFactorToggle"
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-blue-600' : 'bg-slate-300'
          }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
      </button>
    </div>
  );
};

export default TwoFactorToggle;
