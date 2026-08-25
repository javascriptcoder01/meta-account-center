import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPrivacyRequest,
  clearPrivacyError,
  clearPrivacySuccess,
} from '../../redux/slices/privacySlice.js';
import SettingsLayout from '../../components/settings/SettingsLayout.jsx';
import PrivacySettingsCard from '../../components/settings/privacy/PrivacySettingsCard.jsx';
import Alert from '../../components/common/Alert.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const PrivacySettingsPage = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, error, successMessage, loaded } = useSelector(
    (state) => state.privacy
  );

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchPrivacyRequest());
    }
    return () => {
      dispatch(clearPrivacyError());
      dispatch(clearPrivacySuccess());
    };
  }, [dispatch, loaded]);

  return (
    <SettingsLayout
      title="Privacy Settings"
      subtitle="Manage your profile visibility, contact disclosure, and ad personalization preferences."
    >
      <div className="space-y-6">
        {/* Global Alerts */}
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Failed to update privacy settings'}
            onClose={() => dispatch(clearPrivacyError())}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => dispatch(clearPrivacySuccess())}
          />
        )}

        {/* Loading State */}
        {isLoading && !loaded && (
          <div data-testid="privacy-loading-skeleton" className="bg-white rounded-3xl p-12 border border-slate-200 flex items-center justify-center">
            <LoadingSpinner size="lg" color="text-indigo-600" label="Loading privacy settings..." />
          </div>
        )}

        {/* Privacy Form */}
        {(!isLoading || loaded) && (
          <PrivacySettingsCard initialSettings={settings} />
        )}
      </div>
    </SettingsLayout>
  );
};

export default PrivacySettingsPage;
