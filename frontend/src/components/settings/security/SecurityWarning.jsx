
export const SecurityWarning = () => {
  return (
    <div
      role="alert"
      className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3"
    >
      <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <h4 className="font-bold text-amber-900 text-xs">Security Notice & Session Revocation</h4>
        <p className="mt-0.5 text-amber-800 leading-relaxed">
          Changing two-factor authentication configuration will immediately sign you out of all active devices and sessions for your protection. You will need to log in again.
        </p>
      </div>
    </div>
  );
};

export default SecurityWarning;
