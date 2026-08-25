import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import ROUTES from '../../constants/routes.js';
import { forgotPasswordRequest, clearAuthError, clearSuccessMessage } from '../../redux/slices/authSlice.js';

export const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading, error, successMessage } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setValidationError('Email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (validationError) setValidationError('');
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isLoading) return;
    dispatch(forgotPasswordRequest({ email: email.trim() }));
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your Meta account to receive password reset instructions."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Failed to submit request'}
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
            <p className="text-xs text-slate-500">
              For security, if an account is registered with this email, a reset link with instructions has been generated. Please check your inbox and spam folder.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-sm transition"
            >
              Return to Log In
            </Link>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading}
                required
                autoComplete="email"
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'email-error' : undefined}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
                  validationError ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                }`}
              />
              {validationError && (
                <p id="email-error" className="mt-1 text-xs text-red-600 font-medium">
                  {validationError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" label="Sending request..." />
                  <span>Sending request...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 text-center">
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Back to Log In
              </Link>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
