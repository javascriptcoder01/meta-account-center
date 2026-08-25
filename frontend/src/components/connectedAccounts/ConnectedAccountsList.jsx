import React from 'react';
import ConnectedAccountCard from './ConnectedAccountCard.jsx';
import DashboardEmptyState from '../dashboard/DashboardEmptyState.jsx';

export const ConnectedAccountsList = ({
  accounts = [],
  onRequestDisconnect,
  onOpenConnectModal,
  disconnectingId = null,
}) => {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs text-center space-y-4">
        <DashboardEmptyState
          message="No connected accounts"
          description="You haven't linked any Facebook, Instagram, or WhatsApp accounts yet. Connect accounts to share experiences and manage settings seamlessly."
        />
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Connect Your First Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <ConnectedAccountCard
          key={account.id || account.providerUserId}
          account={account}
          onRequestDisconnect={onRequestDisconnect}
          isDisconnecting={disconnectingId === account.id}
        />
      ))}
    </div>
  );
};

export default ConnectedAccountsList;
