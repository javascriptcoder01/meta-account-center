import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator.jsx';
import { isPasswordValid } from '../../utils/passwordValidator.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import ROUTES from '../../constants/routes.js';
import { resetPasswordRequest, clearAuthError, clearSuccessMessage } from '../../redux/slices/authSlice.js';

export const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const { isLoading, error, successMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(() => ({
    token: tokenFromUrl,
    newPassword: '',
    confirmPassword: '',
  }));

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  const validate = () => {
    const errors = {};

    if (!formData.token.trim()) {
      errors.token = 'Reset token is required';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (!isPasswordValid(formData.newPassword)) {
      errors.newPassword = 'Password must meet all complexity requirements';
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
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    dispatch(
      resetPasswordRequest({
        token: formData.token.trim(),
        newPassword: formData.newPassword,
      })
    );
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be secure and different from previously used passwords."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Password reset failed'}
            onClose={() => dispatch(clearAuthError())}
          />
        )}

        {successMessage ? (
          <div className="space-y-4">
            <Alert
              type="success"
              message={successMessage}
              onClose={() => dispatch(clearSuccessMessage())}
            />
            <button
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition"
            >
              Proceed to Log In
            </button>
          </div>
        ) : (
          <>
            {/* Token field (only if not passed via URL) */}
            {!tokenFromUrl && (
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-slate-700 mb-1">
                  Reset Token *
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="Paste your reset token"
                  disabled={isLoading}
                  required
                  aria-invalid={Boolean(validationErrors.token)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
                    validationErrors.token ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                  }`}
                />
                {validationErrors.token && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.token}</p>
                )}
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                New Password *
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                disabled={isLoading}
                error={validationErrors.newPassword}
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator password={formData.newPassword} />
              {validationErrors.newPassword && (
                <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                disabled={isLoading}
                error={validationErrors.confirmPassword}
                autoComplete="new-password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" label="Updating password..." />
                  <span>Updating password...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 text-center">
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Cancel and return to Log In
              </Link>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
