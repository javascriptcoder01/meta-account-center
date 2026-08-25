import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import DashboardEmptyState from './DashboardEmptyState.jsx';

export const ConnectedAccountsCard = ({ connectedAccounts }) => {
  const count = connectedAccounts?.count ?? 0;
  const accounts = Array.isArray(connectedAccounts?.accounts) ? connectedAccounts.accounts : [];

  const getProviderBadge = (provider) => {
    switch (provider?.toUpperCase()) {
      case 'FACEBOOK':
        return {
          label: 'Facebook',
          color: 'bg-blue-600 text-white',
          icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          ),
        };
      case 'INSTAGRAM':
        return {
          label: 'Instagram',
          color: 'bg-pink-600 text-white',
          icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          ),
        };
      case 'WHATSAPP':
        return {
          label: 'WhatsApp',
          color: 'bg-emerald-600 text-white',
          icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
          ),
        };
      default:
        return {
          label: provider || 'Account',
          color: 'bg-slate-600 text-white',
          icon: null,
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h2 className="text-base font-semibold text-slate-900">Connected Accounts</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {count} {count === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        {accounts.length === 0 ? (
          <DashboardEmptyState
            message="No connected accounts"
            description="Link your accounts across Meta technologies to share updates and manage experiences in one place."
          />
        ) : (
          <ul className="divide-y divide-slate-100 my-4">
            {accounts.map((acc, index) => {
              const badge = getProviderBadge(acc.provider);
              const label = acc.displayName || acc.username || badge.label;
              return (
                <li key={acc.id || index} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      aria-label={`${badge.label} icon`}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${badge.color}`}
                    >
                      {badge.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{label}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{badge.label}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium shrink-0">
                    Connected
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <Link
          to={ROUTES.CONNECTED_ACCOUNTS}
          className="w-full inline-flex items-center justify-center py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
        >
          Manage Connected Accounts
        </Link>
      </div>
    </div>
  );
};

export default ConnectedAccountsCard;
