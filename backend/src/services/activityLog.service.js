import activityLogRepository from '../repositories/activityLog.repository.js';

export const sanitizeActivityLog = (log) => {
  return {
    id: log._id,
    action: log.action,
    category: log.category,
    description: log.description,
    deviceName: log.deviceName,
    browser: log.browser,
    operatingSystem: log.operatingSystem,
    ipAddress: log.ipAddress,
    metadata: log.metadata || {},
    createdAt: log.createdAt
  };
};

export const getActivityLogs = async (userId, queryParams) => {
  const page = queryParams.page || 1;
  const limit = queryParams.limit || 20;
  const { category } = queryParams;

  const filter = {};
  if (category) {
    filter.category = category;
  }

  const skip = (page - 1) * limit;

  const [total, rawLogs] = await Promise.all([
    activityLogRepository.countActivityLogs(userId, filter),
    activityLogRepository.findActivityLogs(userId, filter, limit, skip)
  ]);

  const sanitizedLogs = rawLogs.map(sanitizeActivityLog);

  return {
    logs: sanitizedLogs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export default {
  getActivityLogs,
  sanitizeActivityLog
};
