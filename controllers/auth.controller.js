import crypto from 'crypto';
import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { RESPONSE_STATUS, HTTP_STATUS } from '../constants/httpConstants.js';
import { sendVerificationEmail } from '../email/sendEmail.js';
import { AppError, BadRequestError, ConflictError, NotFoundError, TooManyRequestsError } from '../errors/AppError.js';
import { calculateCooldown } from '../utils/calculateCooldown.js';

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

export const verifyEmailLink = catchAsync(async (req, res, next) => {
  const { token, email } = req.query;
  if (!token) return next(new BadRequestError('Token is required'));

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ email });

  if (!user) return next(new NotFoundError('Not user found with this email.'));
  if (user.isEmailVerified) return next(new ConflictError('User already verified'));

  if (user.emailVerificationToken !== hashedToken || user.emailVerificationOTPExpires <= Date.now())
    return next(new BadRequestError('Token is invalid or expired'));

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

export const verifyEmailOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new BadRequestError('Email and OTP are required'));

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({ email });

  if (!user) return next(new NotFoundError('Not user found with this email.'));
  if (user.isEmailVerified) return next(new ConflictError('User already verified'));

  if (user.emailVerificationOTP !== hashedOTP || user.emailVerificationOTPExpires <= Date.now())
    return next(new BadRequestError('OTP is invalid or expired'));

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
