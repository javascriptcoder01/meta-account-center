import User from '../models/User.js';
import ConnectedAccount from '../models/ConnectedAccount.js';
import UserSession from '../models/UserSession.js';
import ActivityLog from '../models/ActivityLog.js';
import SecuritySettings from '../models/SecuritySettings.js';

export const getDashboardOverview = async (userId) => {
  const now = new Date();
  const ACTIVITY_LIMIT = 5;
  const DEVICE_LIMIT = 5;

  const [user, connectedAccounts, securitySettings, recentActivities, activeSessions] =
    await Promise.all([
      User.findById(userId).lean(),

      ConnectedAccount.find({ userId }).lean(),

      SecuritySettings.findOne({ userId }).lean(),

      ActivityLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(ACTIVITY_LIMIT)
        .lean(),

      UserSession.find({
        userId,
        isActive: true,
        revokedAt: null,
        expiresAt: { $gt: now }
      })
        .sort({ lastActivityAt: -1 })
        .limit(DEVICE_LIMIT)
        .lean()
    ]);

  if (!user) {
    return null;
  }
  const activeDeviceCount = await UserSession.countDocuments({
    userId,
    isActive: true,
    revokedAt: null,
    expiresAt: { $gt: now }
  });

  return {
    profile: sanitizeProfile(user),
    connectedAccounts: sanitizeConnectedAccounts(connectedAccounts),
    securityStatus: sanitizeSecurityStatus(securitySettings, activeDeviceCount),
    recentActivities: recentActivities.map(sanitizeActivity),
    connectedDevices: activeSessions.map(sanitizeDevice)
  };
};

const sanitizeProfile = (user) => ({
  firstName: user.name?.firstName ?? null,
  lastName: user.name?.lastName ?? null,
  email: user.email,
  phone: user.phone || null,
  profilePicture: user.profilePicture || null,
  dateOfBirth: user.dateOfBirth || null
});

const sanitizeConnectedAccounts = (accounts) => ({
  count: accounts.length,
  accounts: accounts.map((a) => ({
    id: a._id,
    provider: a.provider,
    displayName: a.displayName || null,
    username: a.username || null,
    connectedAt: a.connectedAt || a.createdAt
  }))
});

const sanitizeSecurityStatus = (settings, activeDeviceCount) => ({
  twoFactorEnabled: settings ? settings.twoFactorEnabled : false,
  twoFactorMethod: settings ? settings.twoFactorMethod : null,
  activeDeviceCount
});

const sanitizeActivity = (log) => ({
  id: log._id,
  action: log.action,
  category: log.category,
  description: log.description,
  deviceName: log.deviceName || null,
  browser: log.browser || null,
  ipAddress: log.ipAddress || null,
  createdAt: log.createdAt
});

const sanitizeDevice = (session) => ({
  id: session._id,
  sessionId: session.sessionId,
  deviceName: session.deviceName || null,
  browser: session.browser || null,
  browserVersion: session.browserVersion || null,
  operatingSystem: session.operatingSystem || null,
  ipAddress: session.ipAddress || null,
  loginAt: session.loginAt,
  lastActivityAt: session.lastActivityAt
});
