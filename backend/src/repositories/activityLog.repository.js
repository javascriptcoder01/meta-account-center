import ActivityLog from '../models/ActivityLog.js';

export const createActivityLog = async (logData) => {
  return ActivityLog.create(logData);
};

export const findActivityLogs = async (userId, filter = {}, limit = 50, skip = 0) => {
  const query = { userId, ...filter };
  return ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const countActivityLogs = async (userId, filter = {}) => {
  const query = { userId, ...filter };
  return ActivityLog.countDocuments(query);
};

export default {
  createActivityLog,
  findActivityLogs,
  countActivityLogs
};

