import mongoose from 'mongoose';

const UserSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true
    },
    deviceName: {
      type: String,
      default: null
    },
    browser: {
      type: String,
      default: null
    },
    browserVersion: {
      type: String,
      default: null
    },
    operatingSystem: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    loginAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    lastActivityAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true
    },
    revokedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'user_sessions',
    versionKey: false
  }
);

UserSessionSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

UserSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 7776000 }
);

const UserSession = mongoose.model('UserSession', UserSessionSchema);

export default UserSession;
