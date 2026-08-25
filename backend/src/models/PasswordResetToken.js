import mongoose from 'mongoose';

const PasswordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    usedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
    collection: 'password_reset_tokens', versionKey: false
  }
);

PasswordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const PasswordResetToken = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetToken;
