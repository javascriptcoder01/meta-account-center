import React from 'react';

export const Alert = ({ type = 'error', message, details = [], onClose, className = '' }) => {
  if (!message && (!details || details.length === 0)) return null;

  const styles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: (
        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: (
        <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: (
        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: (
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  };

  const currentStyle = styles[type] || styles.error;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm shadow-xs ${currentStyle.container} ${className}`}
    >
      {currentStyle.icon}
      <div className="flex-1">
        {message && <p className="font-medium leading-relaxed">{message}</p>}
        {Array.isArray(details) && details.length > 0 && (
          <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-xs">
            {details.map((d, index) => (
              <li key={index}>
                {typeof d === 'string' ? d : d.message || d.msg || JSON.stringify(d)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-slate-600 rounded p-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
