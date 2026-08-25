import PrivacySettings from '../models/PrivacySettings.js';

export const findPrivacySettingsByUserId = async (userId) => {
  return PrivacySettings.findOne({ userId });
};

export const createPrivacySettings = async (settingsData) => {
  return PrivacySettings.create(settingsData);
};

export const updatePrivacySettingsByUserId = async (userId, settingsData) => {
  return PrivacySettings.findOneAndUpdate({ userId }, settingsData, { new: true, runValidators: true });
};

export default {
  findPrivacySettingsByUserId,
  createPrivacySettings,
  updatePrivacySettingsByUserId
};
