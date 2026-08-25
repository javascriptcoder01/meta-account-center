import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import { fetchConnectedAccountsRequest } from '../../redux/slices/connectedAccountsSlice.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ConnectedAccountsHeader = ({ count = 0, onOpenConnectModal }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.connectedAccounts.isLoading);

  return (
    <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <Link
            to={ROUTES.DASHBOARD}
            aria-label="Back to Dashboard"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition shrink-0 mt-1 sm:mt-0"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Connected Experiences
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {count} {count === 1 ? 'account' : 'accounts'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Connected Accounts
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Link and manage your Facebook, Instagram, and WhatsApp profiles in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => dispatch(fetchConnectedAccountsRequest())}
            disabled={isLoading}
            aria-label="Refresh connected accounts"
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Refresh accounts"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="text-slate-600" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenConnectModal}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Connect Account</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ConnectedAccountsHeader;
