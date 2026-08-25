import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePrivacyRequest } from '../../../redux/slices/privacySlice.js';
import VisibilitySelect from './VisibilitySelect.jsx';
import PrivacyToggle from './PrivacyToggle.jsx';
import LoadingSpinner from '../../common/LoadingSpinner.jsx';

export const PrivacySettingsCard = ({ initialSettings }) => {
  const dispatch = useDispatch();
  const isUpdating = useSelector((state) => state.privacy.isUpdating);

  const [formData, setFormData] = useState({
    profileVisibility: initialSettings?.profileVisibility || 'PUBLIC',
    emailVisibility: initialSettings?.emailVisibility || 'PRIVATE',
    phoneVisibility: initialSettings?.phoneVisibility || 'PRIVATE',
    personalizedAds: initialSettings?.personalizedAds ?? true,
    dataSharing: initialSettings?.dataSharing ?? false,
  });

  const [prevInitial, setPrevInitial] = useState(initialSettings);
  if (initialSettings !== prevInitial) {
    setPrevInitial(initialSettings);
    if (initialSettings) {
      setFormData({
        profileVisibility: initialSettings.profileVisibility || 'PUBLIC',
        emailVisibility: initialSettings.emailVisibility || 'PRIVATE',
        phoneVisibility: initialSettings.phoneVisibility || 'PRIVATE',
        personalizedAds: initialSettings.personalizedAds ?? true,
        dataSharing: initialSettings.dataSharing ?? false,
      });
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdating) return;

    const safePayload = {
      profileVisibility: formData.profileVisibility,
      emailVisibility: formData.emailVisibility,
      phoneVisibility: formData.phoneVisibility,
      personalizedAds: formData.personalizedAds,
      dataSharing: formData.dataSharing,
    };

    dispatch(updatePrivacyRequest(safePayload));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Audience and Visibility</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Control who can see your profile details and contact information across connected experiences.
        </p>
      </div>

      <div className="space-y-3">
        <VisibilitySelect
          id="profileVisibility"
          label="Profile Visibility"
          description="Determine who can view your main profile summary and posts."
          value={formData.profileVisibility}
          onChange={(val) => setFormData((prev) => ({ ...prev, profileVisibility: val }))}
          disabled={isUpdating}
        />

        <VisibilitySelect
          id="emailVisibility"
          label="Email Address Visibility"
          description="Control who can view your registered email address."
          value={formData.emailVisibility}
          onChange={(val) => setFormData((prev) => ({ ...prev, emailVisibility: val }))}
          disabled={isUpdating}
        />

        <VisibilitySelect
          id="phoneVisibility"
          label="Phone Number Visibility"
          description="Control who can view your linked phone number."
          value={formData.phoneVisibility}
          onChange={(val) => setFormData((prev) => ({ ...prev, phoneVisibility: val }))}
          disabled={isUpdating}
        />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h2 className="text-lg font-bold text-slate-900">Data Preferences & Ads</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage how your activity is used to personalize ad delivery and connected services.
        </p>
      </div>

      <div className="space-y-3">
        <PrivacyToggle
          id="personalizedAds"
          label="Personalized Ads"
          description="Allow personalized advertisements based on your account activity across Meta technologies."
          checked={formData.personalizedAds}
          onChange={(val) => setFormData((prev) => ({ ...prev, personalizedAds: val }))}
          disabled={isUpdating}
        />

        <PrivacyToggle
          id="dataSharing"
          label="Data Sharing with Partners"
          description="Allow sharing analytical and performance data with verified third-party measurement partners."
          checked={formData.dataSharing}
          onChange={(val) => setFormData((prev) => ({ ...prev, dataSharing: val }))}
          disabled={isUpdating}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isUpdating}
          className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isUpdating ? (
            <>
              <LoadingSpinner size="sm" color="text-white" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            'Save Privacy Preferences'
          )}
        </button>
      </div>
    </form>
  );
};

export default PrivacySettingsCard;
