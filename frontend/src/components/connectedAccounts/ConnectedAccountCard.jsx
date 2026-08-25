import React from 'react';
import ProviderBadge from './ProviderBadge.jsx';
import AccountAvatar from './AccountAvatar.jsx';

export const ConnectedAccountCard = ({ account, onRequestDisconnect, isDisconnecting = false }) => {
  const { provider, displayName, username, profilePicture, connectedAt } = account || {};

  const formattedDate = connectedAt
    ? new Date(connectedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
      <div>
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <AccountAvatar
              src={profilePicture}
              displayName={displayName}
              username={username}
              provider={provider}
              size="md"
            />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">{displayName || 'Connected Account'}</h2>
              {username && <p className="text-xs text-slate-500 truncate">@{username}</p>}
            </div>
          </div>
          <ProviderBadge provider={provider} size="sm" />
        </div>

        <dl className="mt-4 space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex justify-between">
            <dt className="text-slate-400 font-medium">Status</dt>
            <dd className="font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400 font-medium">Connected On</dt>
            <dd className="font-medium text-slate-700">{formattedDate}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={() => onRequestDisconnect(account)}
          disabled={isDisconnecting}
          className="py-2 px-3.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
};

export default ConnectedAccountCard;
