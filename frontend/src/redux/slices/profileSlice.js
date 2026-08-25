import { createSlice } from '@reduxjs/toolkit';

export const sanitizeProfileData = (user) => {
  if (!user || typeof user !== 'object') return null;

  const firstName = user.name?.firstName ?? user.firstName ?? '';
  const lastName = user.name?.lastName ?? user.lastName ?? '';

  return {
    id: user.id || user._id || '',
    firstName: typeof firstName === 'string' ? firstName : '',
    lastName: typeof lastName === 'string' ? lastName : '',
    email: typeof user.email === 'string' ? user.email : '',
    phone: typeof user.phone === 'string' ? user.phone : null,
    dateOfBirth: typeof user.dateOfBirth === 'string' ? user.dateOfBirth : null,
    profilePicture: typeof user.profilePicture === 'string' ? user.profilePicture : null,
    role: typeof user.role === 'string' ? user.role : 'user',
    emailVerified: Boolean(user.emailVerified),
    status: typeof user.status === 'string' ? user.status : 'ACTIVE',
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
};

const initialState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  isChangingPassword: false,
  isChangingEmail: false,
  isChangingPhone: false,
  isUpdatingPicture: false,
  error: null,
  successMessage: null,
  loaded: false,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {

    fetchProfileRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      state.profile = sanitizeProfileData(action.payload);
      state.error = null;
    },
    fetchProfileFailure: (state, action) => {
      state.isLoading = false;
      state.loaded = true;
      state.error = action.payload;
    },

    updateProfileRequest: (state, _action) => {
      state.isUpdating = true;
      state.error = null;
      state.successMessage = null;
    },
    updateProfileSuccess: (state, action) => {
      state.isUpdating = false;
      state.profile = sanitizeProfileData(action.payload?.user || action.payload);
      state.successMessage = action.payload?.message || 'Profile updated successfully.';
      state.error = null;
    },
    updateProfileFailure: (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    },

    changePasswordRequest: (state, _action) => {
      state.isChangingPassword = true;
      state.error = null;
      state.successMessage = null;
    },
    changePasswordSuccess: (state, action) => {
      state.isChangingPassword = false;
      state.successMessage = action.payload?.message || 'Password changed successfully. Please log in again.';
      state.error = null;
    },
    changePasswordFailure: (state, action) => {
      state.isChangingPassword = false;
      state.error = action.payload;
    },

    changeEmailRequest: (state, _action) => {
      state.isChangingEmail = true;
      state.error = null;
      state.successMessage = null;
    },
    changeEmailSuccess: (state, action) => {
      state.isChangingEmail = false;
      state.successMessage = action.payload?.message || 'Email address updated successfully. Please log in again.';
      state.error = null;
    },
    changeEmailFailure: (state, action) => {
      state.isChangingEmail = false;
      state.error = action.payload;
    },

    changePhoneRequest: (state, _action) => {
      state.isChangingPhone = true;
      state.error = null;
      state.successMessage = null;
    },
    changePhoneSuccess: (state, action) => {
      state.isChangingPhone = false;
      state.profile = sanitizeProfileData(action.payload?.user || action.payload);
      state.successMessage = action.payload?.message || 'Phone number updated successfully.';
      state.error = null;
    },
    changePhoneFailure: (state, action) => {
      state.isChangingPhone = false;
      state.error = action.payload;
    },

    changeProfilePictureRequest: (state, _action) => {
      state.isUpdatingPicture = true;
      state.error = null;
      state.successMessage = null;
    },
    changeProfilePictureSuccess: (state, action) => {
      state.isUpdatingPicture = false;
      state.profile = sanitizeProfileData(action.payload?.user || action.payload);
      state.successMessage = action.payload?.message || 'Profile picture updated successfully.';
      state.error = null;
    },
    changeProfilePictureFailure: (state, action) => {
      state.isUpdatingPicture = false;
      state.error = action.payload;
    },

    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileSuccess: (state) => {
      state.successMessage = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.isUpdating = false;
      state.isChangingPassword = false;
      state.isChangingEmail = false;
      state.isChangingPhone = false;
      state.isUpdatingPicture = false;
      state.error = null;
      state.successMessage = null;
      state.loaded = false;
    },
  },
});

export const {
  fetchProfileRequest,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
  changeEmailRequest,
  changeEmailSuccess,
  changeEmailFailure,
  changePhoneRequest,
  changePhoneSuccess,
  changePhoneFailure,
  changeProfilePictureRequest,
  changeProfilePictureSuccess,
  changeProfilePictureFailure,
  clearProfileError,
  clearProfileSuccess,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
