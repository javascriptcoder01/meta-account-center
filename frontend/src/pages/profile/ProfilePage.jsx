import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfileRequest,
  clearProfileError,
  clearProfileSuccess,
} from '../../redux/slices/profileSlice.js';
import ProfileHeader from '../../components/profile/ProfileHeader.jsx';
import ProfilePictureEditor from '../../components/profile/ProfilePictureEditor.jsx';
import PersonalInformationForm from '../../components/profile/PersonalInformationForm.jsx';
import ProfileDetailsCard from '../../components/profile/ProfileDetailsCard.jsx';
import ContactInformationCard from '../../components/profile/ContactInformationCard.jsx';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm.jsx';
import Alert from '../../components/common/Alert.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, isLoading, error, successMessage, loaded } = useSelector((state) => state.profile);
  const authUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchProfileRequest());
    }
    return () => {
      dispatch(clearProfileError());
      dispatch(clearProfileSuccess());
    };
  }, [dispatch, loaded]);

  const currentProfile = profile || authUser;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Global Notifications */}
        {error && (
          <Alert
            type="error"
            message={typeof error === 'string' ? error : error?.message || 'Profile action failed'}
            onClose={() => dispatch(clearProfileError())}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => dispatch(clearProfileSuccess())}
          />
        )}

        {/* Loading State Skeleton */}
        {isLoading && !currentProfile && (
          <div data-testid="profile-loading-skeleton" className="space-y-6 animate-pulse">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 h-32 flex items-center justify-center">
              <LoadingSpinner size="lg" color="text-purple-600" label="Loading profile..." />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 h-64" />
              <div className="bg-white rounded-3xl p-8 border border-slate-200 h-64" />
            </div>
          </div>
        )}

        {/* Loaded Profile View */}
        {currentProfile && (
          <>
            <ProfileHeader profile={currentProfile} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Picture, Personal Information, Details */}
              <div className="space-y-6">
                <ProfilePictureEditor profile={currentProfile} />
                <PersonalInformationForm profile={currentProfile} />
                <ProfileDetailsCard profile={currentProfile} />
              </div>

              {/* Right Column: Contact (Email + Phone) & Password */}
              <div className="space-y-6">
                <ContactInformationCard profile={currentProfile} />
                <ChangePasswordForm />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
