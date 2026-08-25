import SecuritySettings from '../models/SecuritySettings.js';

export const findSecuritySettingsByUserId = async (userId) => {
  return SecuritySettings.findOne({ userId });
};

export const createSecuritySettings = async (settingsData) => {
  return SecuritySettings.create(settingsData);
};

export const updateSecuritySettingsByUserId = async (userId, settingsData) => {
  return SecuritySettings.findOneAndUpdate({ userId }, settingsData, { new: true, runValidators: true });
};

export default {
  findSecuritySettingsByUserId,
  createSecuritySettings,
  updateSecuritySettingsByUserId
};
