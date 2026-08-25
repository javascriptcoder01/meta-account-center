import mongoose from 'mongoose';

const SecuritySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    twoFactorEnabled: {
      type: Boolean,
      required: true,
      default: false
    },
    twoFactorMethod: {
      type: String,
      default: null,
      enum: ['SMS', 'AUTHENTICATOR_APP', 'EMAIL', null]
    },
    lastPasswordChangedAt: {
      type: Date,
      default: null,
      required: false
    }
  },
  {
    timestamps: true,
    collection: 'security_settings',
    versionKey: false
  }
);

const SecuritySettings = mongoose.model('SecuritySettings', SecuritySettingsSchema);

export default SecuritySettings;
