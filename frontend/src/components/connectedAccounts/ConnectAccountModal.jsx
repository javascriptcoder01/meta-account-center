import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectAccountRequest } from '../../redux/slices/connectedAccountsSlice.js';
import { PROVIDERS, ALLOWED_PROVIDERS } from '../../constants/providers.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ConnectAccountModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const isConnecting = useSelector((state) => state.connectedAccounts.isConnecting);

  const [formData, setFormData] = useState({
    provider: PROVIDERS.FACEBOOK,
    providerUserId: '',
    displayName: '',
    username: '',
    profilePicture: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFormData({
        provider: PROVIDERS.FACEBOOK,
        providerUserId: '',
        displayName: '',
        username: '',
        profilePicture: '',
      });
      setValidationErrors({});
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isConnecting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConnecting, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};

    if (!ALLOWED_PROVIDERS.includes(formData.provider)) {
      errors.provider = 'Please select a valid provider';
    }

    if (!formData.providerUserId.trim()) {
      errors.providerUserId = 'Provider User ID is required';
    }

    if (!formData.displayName.trim()) {
      errors.displayName = 'Display Name is required';
    }

    if (formData.profilePicture.trim()) {
      const pic = formData.profilePicture.trim();
      if (!pic.startsWith('https://')) {
        errors.profilePicture = 'Profile picture must be a secure HTTPS URL (e.g. https://...)';
      } else {
        try {
          const parsed = new URL(pic);
          if (parsed.protocol !== 'https:') {
            errors.profilePicture = 'Only HTTPS URLs are allowed';
          }
        } catch {
          errors.profilePicture = 'Please enter a valid URL';
        }
      }
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
    if (!validate() || isConnecting) return;

    const safePayload = {
      provider: formData.provider,
      providerUserId: formData.providerUserId.trim(),
      displayName: formData.displayName.trim(),
      username: formData.username.trim() || undefined,
      profilePicture: formData.profilePicture.trim() || undefined,
    };

    dispatch(connectAccountRequest(safePayload));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="connect-modal-title" className="text-lg font-bold text-slate-900">
              Connect Social Account
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a mock connection to test cross-technology experiences.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isConnecting}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-xs flex items-start gap-2.5">
          <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>Demo Mock Connection:</strong> Simulated integration as supported by backend specification. No external OAuth or real credentials required.
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          <div>
            <label htmlFor="provider" className="block text-xs font-semibold text-slate-700 mb-1">
              Provider *
            </label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              disabled={isConnecting}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
            >
              <option value={PROVIDERS.FACEBOOK}>Facebook</option>
              <option value={PROVIDERS.INSTAGRAM}>Instagram</option>
              <option value={PROVIDERS.WHATSAPP}>WhatsApp</option>
            </select>
            {validationErrors.provider && (
              <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.provider}</p>
            )}
          </div>

          <div>
            <label htmlFor="providerUserId" className="block text-xs font-semibold text-slate-700 mb-1">
              Provider User ID *
            </label>
            <input
              id="providerUserId"
              name="providerUserId"
              type="text"
              value={formData.providerUserId}
              onChange={handleChange}
              placeholder="e.g. fb_123456789"
              disabled={isConnecting}
              required
              aria-invalid={Boolean(validationErrors.providerUserId)}
              aria-describedby={validationErrors.providerUserId ? 'providerUserId-error' : undefined}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationErrors.providerUserId ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                }`}
            />
            {validationErrors.providerUserId && (
              <p id="providerUserId-error" className="mt-1 text-xs text-red-600 font-medium">
                {validationErrors.providerUserId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700 mb-1">
              Display Name *
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              disabled={isConnecting}
              required
              aria-invalid={Boolean(validationErrors.displayName)}
              aria-describedby={validationErrors.displayName ? 'displayName-error' : undefined}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationErrors.displayName ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                }`}
            />
            {validationErrors.displayName && (
              <p id="displayName-error" className="mt-1 text-xs text-red-600 font-medium">
                {validationErrors.displayName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-slate-700 mb-1">
              Username <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. janedoe"
              disabled={isConnecting}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label htmlFor="profilePicture" className="block text-xs font-semibold text-slate-700 mb-1">
              HTTPS Profile Picture URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="url"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              disabled={isConnecting}
              aria-invalid={Boolean(validationErrors.profilePicture)}
              aria-describedby={validationErrors.profilePicture ? 'profilePicture-error' : undefined}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-100 ${validationErrors.profilePicture ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
                }`}
            />
            {validationErrors.profilePicture && (
              <p id="profilePicture-error" className="mt-1 text-xs text-red-600 font-medium">
                {validationErrors.profilePicture}
              </p>
            )}
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-slate-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isConnecting}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConnecting}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  <span>Connecting...</span>
                </>
              ) : (
                'Connect Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectAccountModal;
