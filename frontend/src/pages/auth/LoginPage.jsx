import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import ROUTES from '../../constants/routes.js';
import { loginRequest, clearAuthError } from '../../redux/slices/authSlice.js';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const validate = () => {
    const errors = {};
    const emailTrimmed = formData.email.trim();

    if (!emailTrimmed) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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
      loginRequest({
        email: formData.email.trim(),
        password: formData.password,
      })
    );
  };

  return (
    <AuthLayout
      title="Log in to Meta"
      subtitle="Manage your connected experiences across Facebook, Instagram, and more."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Authentication failed'}
            onClose={() => dispatch(clearAuthError())}
          />
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={isLoading}
            required
            autoComplete="email"
            aria-invalid={Boolean(validationErrors.email)}
            aria-describedby={validationErrors.email ? 'email-error' : undefined}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
              validationErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'
            }`}
          />
          {validationErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600 font-medium">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isLoading}
            error={validationErrors.password}
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600 font-medium">
              {validationErrors.password}
            </p>
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
              <LoadingSpinner size="sm" color="text-white" label="Logging in..." />
              <span>Logging in...</span>
            </>
          ) : (
            'Log In'
          )}
        </button>

        {/* Register Link */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
