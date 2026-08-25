import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';
import { USER_STATUSES } from '../constants/statuses.js';

const UserSchema = new mongoose.Schema(
  {
    name: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please specify a valid email address']
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, 'Please specify a valid E.164 phone number']
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    profilePicture: {
      type: String,
      default: null
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      default: ROLES.USER,
      enum: Object.values(ROLES)
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    status: {
      type: String,
      required: true,
      default: USER_STATUSES.ACTIVE,
      enum: Object.values(USER_STATUSES)
    }
  },
  {
    timestamps: true,
    collection: 'users',
    versionKey: false
  }
);

UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: 'string' } }
  }
);

UserSchema.index({ status: 1, role: 1 });

const User = mongoose.model('User', UserSchema);

export default User;
