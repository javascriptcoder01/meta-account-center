import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator.jsx';
import { isPasswordValid } from '../../utils/passwordValidator.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import ROUTES from '../../constants/routes.js';
import { registerRequest, clearAuthError, clearSuccessMessage } from '../../redux/slices/authSlice.js';

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, successMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  const validate = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneTrimmed = formData.phone.trim();
      if (!/^\+[1-9]\d{1,14}$/.test(phoneTrimmed)) {
        errors.phone = 'Phone number must be in E.164 international format (e.g. +14155552671)';
      }
    }

    if (formData.dateOfBirth) {
      const dobDate = new Date(formData.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        errors.dateOfBirth = 'Date of birth must be a valid date';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isPasswordValid(formData.password)) {
      errors.password = 'Password must meet all complexity requirements';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    if (formData.phone && formData.phone.trim()) {
      payload.phone = formData.phone.trim();
    }

    if (formData.dateOfBirth) {
      payload.dateOfBirth = formData.dateOfBirth;
    }

    dispatch(registerRequest(payload));
  };

  return (
    <AuthLayout
      title="Create your Account"
      subtitle="One account for all your connected Meta experiences."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Registration failed'}
            onClose={() => dispatch(clearAuthError())}
          />
        )}

        {successMessage && (
          <div className="space-y-3">
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
        )}

        {!successMessage && (
          <>
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                  First name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  disabled={isLoading}
                  required
                  autoComplete="given-name"
                  aria-invalid={Boolean(validationErrors.firstName)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
                    validationErrors.firstName ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={isLoading}
                  required
                  autoComplete="family-name"
                  aria-invalid={Boolean(validationErrors.lastName)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
                    validationErrors.lastName ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.doe@example.com"
                disabled={isLoading}
                required
                autoComplete="email"
                aria-invalid={Boolean(validationErrors.email)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
                  validationErrors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone & Date of Birth (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+14155552671"
                  disabled={isLoading}
                  autoComplete="tel"
                  aria-invalid={Boolean(validationErrors.phone)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
                    validationErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-1">
                  Date of birth <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="bday"
                  aria-invalid={Boolean(validationErrors.dateOfBirth)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${
                    validationErrors.dateOfBirth ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                  }`}
                />
                {validationErrors.dateOfBirth && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.dateOfBirth}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password *
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                disabled={isLoading}
                error={validationErrors.password}
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator password={formData.password} />
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm password *
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
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
                  <LoadingSpinner size="sm" color="text-white" label="Creating account..." />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </>
        )}

        {/* Login Link */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
