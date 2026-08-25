import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { disconnectAccountRequest } from '../../redux/slices/connectedAccountsSlice.js';
import ProviderBadge from './ProviderBadge.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const DisconnectAccountModal = ({ isOpen, onClose, account }) => {
  const dispatch = useDispatch();
  const disconnectingId = useSelector((state) => state.connectedAccounts.disconnectingId);
  const isDeleting = disconnectingId === account?.id;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !account) return null;

  const handleConfirm = () => {
    if (!account.id || isDeleting) return;
    dispatch(disconnectAccountRequest(account.id));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 id="disconnect-modal-title" className="text-lg font-bold text-slate-900">
              Disconnect Account?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              This action will remove the linked profile from your Accounts Center.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-sm font-bold text-slate-900 truncate">
              {account.displayName || 'Connected Account'}
            </p>
            {account.username && <p className="text-xs text-slate-500 truncate">@{account.username}</p>}
          </div>
          <ProviderBadge provider={account.provider} size="sm" />
        </div>

        <p className="text-xs text-slate-600">
          You can reconnect this account at any time. Your current login session will remain active.
        </p>

        <div className="flex gap-2.5 pt-4 border-t border-slate-100 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span>Disconnecting...</span>
              </>
            ) : (
              'Confirm Disconnect'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisconnectAccountModal;
