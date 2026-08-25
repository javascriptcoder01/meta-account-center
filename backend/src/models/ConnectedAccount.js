import mongoose from 'mongoose';
import { PROVIDERS } from '../constants/providers.js';
import { CONNECTION_STATUSES } from '../constants/statuses.js';

const ConnectedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      required: true,
      enum: Object.values(PROVIDERS)
    },
    providerUserId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      default: null,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    profilePicture: {
      type: String,
      default: null
    },
    status: {
      type: String,
      required: true,
      default: CONNECTION_STATUSES.CONNECTED,
      enum: Object.values(CONNECTION_STATUSES)
    },
    connectedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'connected_accounts', versionKey: false
  }
);

ConnectedAccountSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

ConnectedAccountSchema.index({ userId: 1, provider: 1 });

const ConnectedAccount = mongoose.model('ConnectedAccount', ConnectedAccountSchema);

export default ConnectedAccount;
