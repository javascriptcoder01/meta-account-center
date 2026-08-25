import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDevicesRequest,
  revokeDeviceRequest,
  clearDeviceError,
  clearDeviceSuccess,
} from '../../redux/slices/deviceSlice.js';
import DeviceManagementHeader from '../../components/devices/DeviceManagementHeader.jsx';
import DeviceList from '../../components/devices/DeviceList.jsx';
import RevokeDeviceModal from '../../components/devices/RevokeDeviceModal.jsx';
import Alert from '../../components/common/Alert.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { parseJwtSessionId } from '../../utils/tokenUtils.js';

export const DeviceManagementPage = () => {
  const dispatch = useDispatch();
  const { devices, isLoading, isRevoking, revokingSessionId, error, successMessage, loaded } =
    useSelector((state) => state.device);
  const accessToken = useSelector((state) => state.auth?.accessToken);

  const [modalDevice, setModalDevice] = useState(null);

  const currentSessionId = parseJwtSessionId(accessToken);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchDevicesRequest());
    }
    return () => {
      dispatch(clearDeviceError());
      dispatch(clearDeviceSuccess());
    };
  }, [dispatch, loaded]);

  const handleRefresh = () => {
    dispatch(fetchDevicesRequest());
  };

  const handleOpenRevokeModal = (device) => {
    setModalDevice(device);
  };

  const handleCloseRevokeModal = () => {
    setModalDevice(null);
  };

  const handleConfirmRevoke = (sessionId) => {
    dispatch(revokeDeviceRequest(sessionId));
    setModalDevice(null);
  };

  const isModalCurrentDevice = Boolean(
    modalDevice && currentSessionId && modalDevice.sessionId === currentSessionId
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="space-y-2">
            <Alert
              type="error"
              message={typeof error === 'string' ? error : error?.message || 'Failed to load active devices'}
              onClose={() => dispatch(clearDeviceError())}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => dispatch(clearDeviceSuccess())}
          />
        )}

        {/* Header */}
        <DeviceManagementHeader
          activeDeviceCount={devices.length}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Security Informational Notice */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xs text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-800">Device Security & Sessions</p>
            <p>
              If you notice an unrecognized device or location, sign out that device immediately and update your password to secure your account.
            </p>
          </div>
        </div>

        {/* Initial Loading Skeleton */}
        {isLoading && !loaded && (
          <div data-testid="device-loading-skeleton" className="space-y-4 animate-pulse">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 h-28 flex items-center justify-center">
              <LoadingSpinner size="lg" color="text-indigo-600" label="Loading active devices..." />
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 h-28" />
          </div>
        )}

        {/* Devices List */}
        {(!isLoading || loaded) && (
          <DeviceList
            devices={devices}
            currentSessionId={currentSessionId}
            onRevoke={handleOpenRevokeModal}
            revokingSessionId={isRevoking ? revokingSessionId : null}
          />
        )}

        {/* Revocation Confirmation Dialog */}
        <RevokeDeviceModal
          isOpen={Boolean(modalDevice)}
          device={modalDevice}
          isCurrentDevice={isModalCurrentDevice}
          onConfirm={handleConfirmRevoke}
          onClose={handleCloseRevokeModal}
          isLoading={isRevoking}
        />
      </div>
    </div>
  );
};

export default DeviceManagementPage;
