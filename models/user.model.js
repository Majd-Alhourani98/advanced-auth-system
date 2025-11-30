import crypto from 'crypto';

import argon2 from 'argon2';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name must be less than 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },

    username: String,
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'password must be at least 8 characters'],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (value) {
          return value === this.password;
        },

        message: 'Passwords do not match',
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,

    emailVerificationOTP: String,
    emailVerificationOTPExpires: Date,
  },
  {
    timestamps: true,
  }
);

const sanitizeFields = [
  'password',
  'passwordConfirm',
  'emailVerificationToken',
  'emailVerificationTokenExpires',
  'passwordResetToken',
  'passwordResetExpires',
  'emailVerificationOTP',
  'emailVerificationOTPExpires',
  '__v',
  'createdAt',
  'updatedAt',
];

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    sanitizeFields.forEach(field => delete ret[field]);
    return ret;
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (!this.password) return;

  this.password = await argon2.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', async function () {
  // Only generate username if it's missing
  if (!this.username) {
    // create base username from name
    const base = this.name.replace(/\s+/g, '-').toLowerCase();
    let candidate = base;

    // Check if username exists, if yes → add random suffix
    while (await mongoose.models.User.findOne({ username: candidate })) {
      candidate = `${base}_${nanoid(5)}`.toLowerCase();
    }

    // Save the unique username
    this.username = candidate;
  }
});

const getExpiryTimestamp = durationMs => {
  return Date.now() + durationMs;
};

userSchema.methods.generateEmailVerificationToken = function (length = 32, expiryDuratoinMs = 10 * 60 * 1000) {
  const token = crypto.randomBytes(length).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationTokenExpires = getExpiryTimestamp(expiryDuratoinMs);

  return token;
};

userSchema.methods.generateEmailVerificationOTP = function (length = 6, expiryDuratoinMs = 10 * 60 * 1000) {
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10);
  }

  this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationOTPExpires = getExpiryTimestamp(expiryDuratoinMs);

  return otp;
};

const User = mongoose.model('User', userSchema);

export default User;
