import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordRequest } from '../../redux/slices/profileSlice.js';
import PasswordInput from '../auth/PasswordInput.jsx';
import PasswordStrengthIndicator from '../auth/PasswordStrengthIndicator.jsx';
import { isPasswordValid } from '../../utils/passwordValidator.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const isChangingPassword = useSelector((state) => state.profile.isChangingPassword);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const validate = () => {
    const errors = {};

    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (!isPasswordValid(formData.newPassword)) {
      errors.newPassword = 'New password must meet all complexity requirements';
    } else if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      errors.newPassword = 'New password must be different from your current password';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isChangingPassword) return;

    dispatch(
      changePasswordRequest({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    );

    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-base font-semibold text-slate-900">Password & Security</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Authentication</span>
      </div>

      <div className="space-y-4">
        {!isEditing ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account Password</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">••••••••••••</p>
              <p className="text-xs text-slate-500 mt-0.5">Choose a strong, unique password to safeguard your account.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setValidationErrors({});
              }}
              className="py-2 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer self-start sm:self-center"
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Security Notice:</strong> Changing your password will immediately sign out all active sessions across all devices. You will need to log in again with your new password.
              </span>
            </div>

            <div>
              <label htmlFor="currentPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password *
              </label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                disabled={isChangingPassword}
                error={validationErrors.currentPassword}
                autoComplete="current-password"
              />
              {validationErrors.currentPassword && (
                <p id="currentPassword-error" className="mt-1 text-xs text-red-600 font-medium">
                  {validationErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                New Password *
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new strong password"
                disabled={isChangingPassword}
                error={validationErrors.newPassword}
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator password={formData.newPassword} />
              {validationErrors.newPassword && (
                <p id="newPassword-error" className="mt-1 text-xs text-red-600 font-medium">
                  {validationErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                disabled={isChangingPassword}
                error={validationErrors.confirmPassword}
                autoComplete="new-password"
              />
              {validationErrors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-xs text-red-600 font-medium">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <LoadingSpinner size="sm" color="text-white" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  'Update Password & Sign Out'
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isChangingPassword}
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

export default ChangePasswordForm;
