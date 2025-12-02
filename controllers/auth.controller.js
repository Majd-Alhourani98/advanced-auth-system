import crypto from 'crypto';
import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { RESPONSE_STATUS, HTTP_STATUS } from '../constants/httpConstants.js';
import { sendVerificationEmail } from '../email/sendEmail.js';
import { BadRequestError, ConflictError, NotFoundError, TooManyRequestsError } from '../errors/AppError.js';
import { calculateCooldown } from '../utils/calculateCooldown.js';

import geoip from 'geoip-lite';

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, verifyMethod = 'otp' } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new ConflictError('Email already in use'));

  const user = new User({ name, email, password, passwordConfirm });

  const { message, token, otp } = user.applyVerificationMethod(verifyMethod);

  await user.save();

  await sendVerificationEmail(user, verifyMethod, token, otp);

  res.status(HTTP_STATUS.CREATED).json({
    status: RESPONSE_STATUS.SUCCESS,
    message,
    data: { user },
  });
});

export const resendVerification = catchAsync(async (req, res, next) => {
  const { email, verifyMethod = 'otp' } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new NotFoundError('Not user found with this email.'));
  if (user.isEmailVerified) return next(new ConflictError('User already verified'));

  if (user.nextAllowedVerificationAt && Date.now() < user.nextAllowedVerificationAt) {
    const secondsLeft = Math.ceil((user.nextAllowedVerificationAt - Date.now()) / 1000);
    return next(new TooManyRequestsError(`Please wait ${secondsLeft} seconds before requesting again.`));
  }

  const { message, token, otp } = user.applyVerificationMethod(verifyMethod);

  user.verificationResendCount = (user.verificationResendCount || 0) + 1;
  user.nextAllowedVerificationAt = Date.now() + calculateCooldown(user.verificationResendCount);
  user.lastVerificationEmailSentAt = Date.now();
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user, verifyMethod, token, otp);

  res.status(HTTP_STATUS.OK).json({
    status: RESPONSE_STATUS.SUCCESS,
    message: message,
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { otp, email: bodyEmail } = req.body;
  const { token, email: queryEmail } = req.query;

  if ((token && otp) || (!token && !otp)) {
    return next(new BadRequestError('Provide either token or OTP, not both.'));
  }

  let user;

  if (token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user = await User.findOne({ email: queryEmail });
    if (!user) return next(new NotFoundError('No user found with this email.'));
    if (user.isEmailVerified) return next(new ConflictError('User already verified'));

    if (user.emailVerificationToken !== hashedToken || user.emailVerificationTokenExpires <= Date.now())
      return next(new BadRequestError('Token is invalid or expired'));
  } else if (otp) {
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    user = await User.findOne({ email: bodyEmail });
    if (!user) return next(new NotFoundError('No user found with this email.'));
    if (user.isEmailVerified) return next(new ConflictError('User already verified'));

    if (user.emailVerificationOTP !== hashedOTP || user.emailVerificationOTPExpires <= Date.now())
      return next(new BadRequestError('OTP is invalid or expired'));
  } else {
    return next(new BadRequestError('Insufficient data for verification'));
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpires = undefined;
  user.lastVerificationEmailSentAt = null;
  user.verificationResendCount = 0;
  user.nextAllowedVerificationAt = null;

  await user.save({ validateBeforeSave: false });

  res.status(HTTP_STATUS.OK).json({
    status: RESPONSE_STATUS.SUCCESS,
    message: 'Email verified successfully',
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const ip = '91.151.226.72';
  const userAgent = req.get('User-Agent');

  // 1. Validate input
  if (!email || !password) return next(new BadRequestError('Email and password are required'));

  // 2. Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new NotFoundError('Email or password is incorrect'));

  const geo = geoip.lookup(ip);
  const geoLocation = geo ? `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}` : '';

  // 3. Check if user is temporarily blocked
  if (user.isBlocked()) {
    const remaining = user.getRemainingBlockMinutes();
    user.addLoginHistoryEntry(false, ip, userAgent, geoLocation);
    await user.save({ validateBeforeSave: false });

    return next(new BadRequestError(`Too many failed login attempts. Try again in ${remaining} minutes`));
  }

  // 4. Verify password
  const isPasswordCorrect = await user.verifyPassword(password);

  if (!isPasswordCorrect) {
    user.addLoginHistoryEntry(false, ip, userAgent, geoLocation);
    await user.incrementLoginAttempts();
    return next(new BadRequestError('Email or password is incorrect'));
  }

  user.addLoginHistoryEntry(true, ip, userAgent, geoLocation);
  await user.resetLoginAttempts();

  // 5. Check if email is verified
  if (!user.isEmailVerified) return next(new ConflictError('Email or password is incorrect'));

  // 6. Respond with user data (sanitized by model)
  res.status(HTTP_STATUS.OK).json({
    status: RESPONSE_STATUS.SUCCESS,
    message: 'Login successful',
    data: { user },
  });
});
