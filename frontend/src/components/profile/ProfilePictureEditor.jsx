import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeProfilePictureRequest } from '../../redux/slices/profileSlice.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ProfilePictureEditor = ({ profile }) => {
  const dispatch = useDispatch();
  const isUpdatingPicture = useSelector((state) => state.profile.isUpdatingPicture);

  const [imageUrl, setImageUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentPicture = profile?.profilePicture || null;
  const [prevPicture, setPrevPicture] = useState(currentPicture);

  if (currentPicture !== prevPicture) {
    setPrevPicture(currentPicture);
    setImageError(false);
  }

  const firstName = profile?.firstName || '';
  const lastName = profile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';

  const initials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : firstName
      ? firstName.charAt(0).toUpperCase()
      : 'U';

  const validateUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) {
      return 'Please enter an image URL';
    }
    if (!trimmed.startsWith('https://')) {
      return 'Profile picture URL must use secure HTTPS protocol (e.g. https://example.com/avatar.jpg)';
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:') {
        return 'Only HTTPS URLs are permitted';
      }
    } catch {
      return 'Please enter a valid URL';
    }
    return '';
  };

  const handleSave = (e) => {
    e.preventDefault();
    const err = validateUrl(imageUrl);
    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError('');
    dispatch(changeProfilePictureRequest({ profilePicture: imageUrl.trim() }));
    setIsEditing(false);
    setImageUrl('');
  };

  const handleRemove = () => {
    dispatch(changeProfilePictureRequest({ profilePicture: null }));
    setImageError(false);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-base font-semibold text-slate-900">Profile Picture</h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

        <div className="relative shrink-0">
          {currentPicture && !imageError ? (
            <img
              src={currentPicture}
              alt={`${fullName}'s profile avatar`}
              onError={() => setImageError(true)}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-xs"
            />
          ) : (
            <div
              aria-label="Profile initials avatar"
              className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md shadow-blue-500/20"
            >
              {initials}
            </div>
          )}
        </div>


        <div className="flex-1 text-center sm:text-left space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{fullName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentPicture && !imageError
                ? 'Your photo is visible across your Meta experiences.'
                : 'No custom photo set. Displaying default initials avatar.'}
            </p>
          </div>

          {!isEditing ? (
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setImageUrl(currentPicture || '');
                  setValidationError('');
                }}
                disabled={isUpdatingPicture}
                className="py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {currentPicture ? 'Update Photo URL' : 'Set Photo URL'}
              </button>

              {currentPicture && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUpdatingPicture}
                  className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPicture ? <LoadingSpinner size="sm" color="text-red-700" /> : 'Remove Photo'}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} noValidate className="space-y-3 max-w-md">
              <div>
                <label htmlFor="profilePicture" className="block text-xs font-medium text-slate-700 mb-1">
                  HTTPS Image URL
                </label>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isUpdatingPicture}
                  required
                  aria-invalid={Boolean(validationError)}
                  aria-describedby={validationError ? 'picture-url-error' : undefined}
                  className={`w-full px-3.5 py-2 text-xs bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationError ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                    }`}
                />
                {validationError && (
                  <p id="picture-url-error" className="mt-1 text-xs text-red-600 font-medium">
                    {validationError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdatingPicture}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPicture ? (
                    <>
                      <LoadingSpinner size="sm" color="text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Picture'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdatingPicture}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureEditor;
