import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePhoneRequest } from '../../redux/slices/profileSlice.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ChangePhoneForm = ({ currentPhone = null }) => {
  const dispatch = useDispatch();
  const isChangingPhone = useSelector((state) => state.profile.isChangingPhone);

  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const validate = () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setValidationError('Please enter a phone number');
      return false;
    }
    if (!/^\+[1-9]\d{1,14}$/.test(trimmed)) {
      setValidationError('Phone number must be in E.164 international format (e.g. +14155550199 or +919876543210)');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate() || isChangingPhone) return;

    dispatch(changePhoneRequest({ phone: phone.trim() }));
    setIsEditing(false);
    setPhone('');
  };

  const handleRemove = () => {
    dispatch(changePhoneRequest({ phone: null }));
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <h2 className="text-base font-semibold text-slate-900">Phone Number</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Security & Recovery</span>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Phone</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{currentPhone || 'No phone number provided'}</p>
          </div>
          {!isEditing && (
            <div className="flex gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setPhone(currentPhone || '');
                  setValidationError('');
                }}
                disabled={isChangingPhone}
                className="py-2 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                {currentPhone ? 'Update Phone' : 'Add Phone'}
              </button>

              {currentPhone && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isChangingPhone}
                  className="py-2 px-3.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  {isChangingPhone ? <LoadingSpinner size="sm" color="text-red-700" /> : 'Remove'}
                </button>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <form onSubmit={handleSave} noValidate className="space-y-4 pt-2">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (E.164 international format) *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="+14155550199"
                disabled={isChangingPhone}
                required
                autoComplete="tel"
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'phone-error' : undefined}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationError ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                  }`}
              />
              {validationError && (
                <p id="phone-error" className="mt-1 text-xs text-red-600 font-medium">
                  {validationError}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isChangingPhone}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isChangingPhone ? (
                  <>
                    <LoadingSpinner size="sm" color="text-white" />
                    <span>Saving Phone...</span>
                  </>
                ) : (
                  'Save Phone Number'
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isChangingPhone}
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

export default ChangePhoneForm;
