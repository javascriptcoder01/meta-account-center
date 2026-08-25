import PrivacySettings from '../models/PrivacySettings.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import { ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const sanitizePrivacy = (settings) => {
  return {
    profileVisibility: settings.profileVisibility,
    emailVisibility: settings.emailVisibility,
    phoneVisibility: settings.phoneVisibility,
    personalizedAds: settings.personalizedAds,
    dataSharing: settings.dataSharing,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt
  };
};

export const getPrivacySettings = async (userId) => {
  let settings = await PrivacySettings.findOne({ userId });

  if (!settings) {
    try {
      settings = await PrivacySettings.create({
        userId,
        profileVisibility: 'PUBLIC',
        emailVisibility: 'PRIVATE',
        phoneVisibility: 'PRIVATE',
        personalizedAds: true,
        dataSharing: false
      });
    } catch (error) {
      if (error.code === 11000) {
        settings = await PrivacySettings.findOne({ userId });
      } else {
        throw error;
      }
    }
  }

  return settings;
};

export const updatePrivacySettings = async (userId, updateData) => {
  const settings = await getPrivacySettings(userId);

  const updates = {};
  const changedFields = [];

  const fieldsToCheck = [
    'profileVisibility',
    'emailVisibility',
    'phoneVisibility',
    'personalizedAds',
    'dataSharing'
  ];

  for (const field of fieldsToCheck) {
    if (updateData[field] !== undefined && updateData[field] !== settings[field]) {
      updates[field] = updateData[field];
      changedFields.push(field);
    }
  }

  if (changedFields.length === 0) {
    return sanitizePrivacy(settings);
  }

  const updatedSettings = await PrivacySettings.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  await ActivityLog.create({
    userId,
    action: ACTIVITY_ACTIONS.PRIVACY_UPDATED,
    category: ACTIVITY_CATEGORIES.PRIVACY,
    description: 'Privacy settings updated successfully',
    metadata: { changedFields }
  });

  return sanitizePrivacy(updatedSettings);
};
