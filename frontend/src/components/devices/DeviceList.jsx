import React from 'react';
import DeviceCard from './DeviceCard.jsx';
import DeviceEmptyState from './DeviceEmptyState.jsx';

export const DeviceList = ({
  devices = [],
  currentSessionId = null,
  onRevoke,
  revokingSessionId = null,
}) => {
  if (!devices || devices.length === 0) {
    return <DeviceEmptyState />;
  }

  const sortedDevices = [...devices].sort((a, b) => {
    if (a.sessionId === currentSessionId) return -1;
    if (b.sessionId === currentSessionId) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {sortedDevices.map((device) => {
        const isCurrent = Boolean(currentSessionId && device.sessionId === currentSessionId);
        const isRevoking = revokingSessionId === device.sessionId;

        return (
          <DeviceCard
            key={device.sessionId || device.id}
            device={device}
            isCurrentDevice={isCurrent}
            onRevoke={onRevoke}
            isRevoking={isRevoking}
          />
        );
      })}
    </div>
  );
};

export default DeviceList;
