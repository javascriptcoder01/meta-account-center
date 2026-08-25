import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConnectedAccountsRequest,
  clearConnectedAccountsError,
  clearConnectedAccountsSuccess,
} from '../../redux/slices/connectedAccountsSlice.js';
import ConnectedAccountsHeader from '../../components/connectedAccounts/ConnectedAccountsHeader.jsx';
import ConnectedAccountsList from '../../components/connectedAccounts/ConnectedAccountsList.jsx';
import ConnectAccountModal from '../../components/connectedAccounts/ConnectAccountModal.jsx';
import DisconnectAccountModal from '../../components/connectedAccounts/DisconnectAccountModal.jsx';
import Alert from '../../components/common/Alert.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const ConnectedAccountsPage = () => {
  const dispatch = useDispatch();
  const { accounts, isLoading, error, successMessage, disconnectingId, loaded } = useSelector(
    (state) => state.connectedAccounts
  );

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedAccountForDisconnect, setSelectedAccountForDisconnect] = useState(null);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchConnectedAccountsRequest());
    }
    return () => {
      dispatch(clearConnectedAccountsError());
      dispatch(clearConnectedAccountsSuccess());
    };
  }, [dispatch, loaded]);

  const handleRequestDisconnect = (account) => {
    setSelectedAccountForDisconnect(account);
  };

  const handleCloseDisconnectModal = () => {
    setSelectedAccountForDisconnect(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Global Alerts */}
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Operation failed'}
            onClose={() => dispatch(clearConnectedAccountsError())}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => dispatch(clearConnectedAccountsSuccess())}
          />
        )}

        {/* Header */}
        <ConnectedAccountsHeader
          count={accounts.length}
          onOpenConnectModal={() => setIsConnectModalOpen(true)}
        />

        {/* Loading Skeleton */}
        {isLoading && !loaded && (
          <div data-testid="accounts-loading-skeleton" className="space-y-6 animate-pulse">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 h-32 flex items-center justify-center">
              <LoadingSpinner size="lg" color="text-indigo-600" label="Loading connected accounts..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 h-48" />
              <div className="bg-white rounded-3xl p-6 border border-slate-200 h-48" />
              <div className="bg-white rounded-3xl p-6 border border-slate-200 h-48" />
            </div>
          </div>
        )}

        {/* Accounts List / Grid */}
        {(!isLoading || loaded) && (
          <ConnectedAccountsList
            accounts={accounts}
            onRequestDisconnect={handleRequestDisconnect}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            disconnectingId={disconnectingId}
          />
        )}

        {/* Modals */}
        <ConnectAccountModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />

        <DisconnectAccountModal
          isOpen={Boolean(selectedAccountForDisconnect)}
          onClose={handleCloseDisconnectModal}
          account={selectedAccountForDisconnect}
        />
      </div>
    </div>
  );
};

export default ConnectedAccountsPage;
