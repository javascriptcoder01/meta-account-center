import mongoose from 'mongoose';
import { ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES } from '../constants/activityTypes.js';

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_ACTIONS)
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_CATEGORIES)
    },
    description: {
      type: String,
      required: true
    },
    deviceName: {
      type: String,
      default: null
    },
    browser: {
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
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: false, },
    collection: 'activity_logs', versionKey: false
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });

ActivityLogSchema.index({ userId: 1, category: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
