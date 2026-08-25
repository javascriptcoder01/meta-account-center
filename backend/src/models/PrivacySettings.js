import mongoose from 'mongoose';

const PrivacySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    profileVisibility: {
      type: String,
      required: true,
      default: 'PUBLIC',
      enum: ['PUBLIC', 'FRIENDS', 'PRIVATE']
    },
    emailVisibility: {
      type: String,
      required: true,
      default: 'PRIVATE',
      enum: ['PUBLIC', 'FRIENDS', 'PRIVATE']
    },
    phoneVisibility: {
      type: String,
      required: true,
      default: 'PRIVATE',
      enum: ['PUBLIC', 'FRIENDS', 'PRIVATE']
    },
    personalizedAds: {
      type: Boolean,
      required: true,
      default: true
    },
    dataSharing: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'privacy_settings',
    versionKey: false
  }
);

const PrivacySettings = mongoose.model('PrivacySettings', PrivacySettingsSchema);

export default PrivacySettings;
