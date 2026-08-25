import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileRequest } from '../../redux/slices/profileSlice.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const PersonalInformationForm = ({ profile }) => {
  const dispatch = useDispatch();
  const isUpdating = useSelector((state) => state.profile.isUpdating);

  const [prevProfile, setPrevProfile] = useState(profile);
  const [formData, setFormData] = useState(() => {
    const dobFormatted = profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
      : '';
    return {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      dateOfBirth: dobFormatted,
    };
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  if (profile !== prevProfile) {
    setPrevProfile(profile);
    const dobFormatted = profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
      : '';
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      dateOfBirth: dobFormatted,
    });
    setHasChanges(false);
  }

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

    if (formData.dateOfBirth) {
      const dobDate = new Date(formData.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        errors.dateOfBirth = 'Date of birth must be a valid date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isUpdating) return;

    const safePayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth || null,
    };

    dispatch(updateProfileRequest(safePayload));
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Names & Birthdate</span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-xs font-semibold text-slate-700 mb-1">
              First name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Jane"
              disabled={isUpdating}
              required
              aria-invalid={Boolean(validationErrors.firstName)}
              aria-describedby={validationErrors.firstName ? 'firstName-error' : undefined}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationErrors.firstName ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                }`}
            />
            {validationErrors.firstName && (
              <p id="firstName-error" className="mt-1 text-xs text-red-600 font-medium">
                {validationErrors.firstName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-xs font-semibold text-slate-700 mb-1">
              Last name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              disabled={isUpdating}
              required
              aria-invalid={Boolean(validationErrors.lastName)}
              aria-describedby={validationErrors.lastName ? 'lastName-error' : undefined}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationErrors.lastName ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                }`}
            />
            {validationErrors.lastName && (
              <p id="lastName-error" className="mt-1 text-xs text-red-600 font-medium">
                {validationErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-slate-700 mb-1">
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={isUpdating}
            aria-invalid={Boolean(validationErrors.dateOfBirth)}
            aria-describedby={validationErrors.dateOfBirth ? 'dob-error' : undefined}
            className={`w-full sm:w-1/2 px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationErrors.dateOfBirth ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
              }`}
          />
          {validationErrors.dateOfBirth && (
            <p id="dob-error" className="mt-1 text-xs text-red-600 font-medium">
              {validationErrors.dateOfBirth}
            </p>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isUpdating || !hasChanges}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span>Saving...</span>
              </>
            ) : (
              'Save Personal Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformationForm;
