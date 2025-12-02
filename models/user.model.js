import crypto from 'crypto';

import argon2 from 'argon2';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import cron from 'node-cron';

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

    lastVerificationEmailSentAt: {
      type: Date,
      default: null,
    },

    verificationResendCount: {
      type: Number,
      default: 0,
    },

    nextAllowedVerificationAt: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    nextAllowedLoginAt: {
      type: Date,
      default: null,
    },

    loginHistory: [
      {
        success: {
          type: Boolean,
          required: true,
        },
        ip: String,
        userAgent: String,
        geoLocation: String, // e.g., "New York, US"
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
  'loginHistory',
  'lastVerificationEmailSentAt',
  'verificationResendCount',
  'nextAllowedVerificationAt',
  'loginAttempts',
];

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    sanitizeFields.forEach(field => delete ret[field]);
    return ret;
  },
});
userSchema.set('toObject', { virtuals: true });

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

userSchema.methods.applyVerificationMethod = function (method = 'otp') {
  if (method === 'link') {
    const token = this.generateEmailVerificationToken();
    return {
      message: 'Signup successful! A verification link has been sent to your email.',
      token,
    };
  }

  const otp = this.generateEmailVerificationOTP();
  return {
    message: 'Signup successful! An OTP has been sent to your email.',
    otp,
  };
};

userSchema.methods.verifyPassword = async function (candidatePassword) {
  return await argon2.verify(this.password, candidatePassword);
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.nextAllowedLoginAt = null;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts = (this.loginAttempts || 0) + 1;

  // Block login for 1 hour after 10 failed attempts
  if (this.loginAttempts >= 10) {
    this.nextAllowedLoginAt = Date.now() + 60 * 60 * 1000;
    this.loginAttempts = 0;
  }

  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isBlocked = function () {
  return this.nextAllowedLoginAt && Date.now() < this.nextAllowedLoginAt;
};

userSchema.methods.getRemainingBlockMinutes = function () {
  return Math.ceil((this.nextAllowedLoginAt - Date.now()) / (1000 * 60));
};

userSchema.methods.addLoginHistoryEntry = function (success, ip, userAgent, geoLocation) {
  this.loginHistory.push({
    success,
    ip,
    userAgent,
    geoLocation,
    timestamp: Date.now(),
  });

  if (this.loginHistory.length > 20) {
    this.loginHistory.splice(0, this.loginHistory.length - 20);
  }
};

userSchema.virtual('lastFailedLoginAt').get(function () {
  const failures = this.loginHistory.filter(entry => !entry.success);
  return failures.length ? failures[failures.length - 1].timestamp : null;
});

userSchema.virtual('lastLoginAt').get(function () {
  const successes = this.loginHistory.filter(entry => entry.success);
  return successes.length ? successes[successes.length - 1].timestamp : null;
});

const User = mongoose.model('User', userSchema);

export default User;
