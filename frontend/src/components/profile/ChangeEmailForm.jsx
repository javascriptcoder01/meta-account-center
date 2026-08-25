import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeEmailRequest } from '../../redux/slices/profileSlice.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ChangeEmailForm = ({ currentEmail = '' }) => {
  const dispatch = useDispatch();
  const isChangingEmail = useSelector((state) => state.profile.isChangingEmail);

  const [newEmail, setNewEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const validate = () => {
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setValidationError('New email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (trimmed.toLowerCase() === currentEmail.trim().toLowerCase()) {
      setValidationError('New email must be different from your current email');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isChangingEmail) return;

    dispatch(changeEmailRequest({ email: newEmail.trim() }));
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-base font-semibold text-slate-900">Email Address</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Primary Contact</span>
      </div>

      <div className="space-y-4">

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Email</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{currentEmail || 'Not specified'}</p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setNewEmail('');
                setValidationError('');
              }}
              className="py-2 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer self-start sm:self-center"
            >
              Change Email
            </button>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Important:</strong> Changing your email address will automatically revoke all active sessions for security. You will be required to log in again.
              </span>
            </div>

            <div>
              <label htmlFor="newEmail" className="block text-xs font-semibold text-slate-700 mb-1">
                New Email Address *
              </label>
              <input
                id="newEmail"
                name="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="new.email@example.com"
                disabled={isChangingEmail}
                required
                autoComplete="email"
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'new-email-error' : undefined}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationError ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                  }`}
              />
              {validationError && (
                <p id="new-email-error" className="mt-1 text-xs text-red-600 font-medium">
                  {validationError}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isChangingEmail}
                className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isChangingEmail ? (
                  <>
                    <LoadingSpinner size="sm" color="text-white" />
                    <span>Updating Email...</span>
                  </>
                ) : (
                  'Confirm & Update Email'
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isChangingEmail}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangeEmailForm;
