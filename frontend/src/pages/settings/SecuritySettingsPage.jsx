import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSecuritySettingsRequest,
  clearSecuritySettingsError,
  clearSecuritySettingsSuccess,
} from '../../redux/slices/securitySettingsSlice.js';
import SettingsLayout from '../../components/settings/SettingsLayout.jsx';
import SecuritySettingsCard from '../../components/settings/security/SecuritySettingsCard.jsx';
import Alert from '../../components/common/Alert.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const SecuritySettingsPage = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, error, successMessage, loaded } = useSelector(
    (state) => state.securitySettings
  );

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchSecuritySettingsRequest());
    }
    return () => {
      dispatch(clearSecuritySettingsError());
      dispatch(clearSecuritySettingsSuccess());
    };
  }, [dispatch, loaded]);

  return (
    <SettingsLayout
      title="Password & Security"
      subtitle="Manage two-factor authentication configuration and review password change security logs."
    >
      <div className="space-y-6">
        {/* Global Alerts */}
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Failed to update security settings'}
            onClose={() => dispatch(clearSecuritySettingsError())}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => dispatch(clearSecuritySettingsSuccess())}
          />
        )}

        {/* Loading State */}
        {isLoading && !loaded && (
          <div data-testid="security-loading-skeleton" className="bg-white rounded-3xl p-12 border border-slate-200 flex items-center justify-center">
            <LoadingSpinner size="lg" color="text-indigo-600" label="Loading security settings..." />
          </div>
        )}

        {/* Security Form & History */}
        {(!isLoading || loaded) && (
          <SecuritySettingsCard initialSettings={settings} />
        )}
      </div>
    </SettingsLayout>
  );
};

export default SecuritySettingsPage;
