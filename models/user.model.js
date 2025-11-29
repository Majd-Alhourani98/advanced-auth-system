const argon2 = require('argon2');
const mongoose = require('mongoose');

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

const User = mongoose.model('User', userSchema);

module.exports = User;
