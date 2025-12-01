import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { RESPONSE_STATUS, HTTP_STATUS } from '../constants/httpConstants.js';
import { sendVerificationEmail } from '../email/sendEmail.js';
import { ConflictError, NotFoundError, TooManyRequestsError } from '../errors/AppError.js';

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

const calculateCooldown = resendCount => {
  const baseCooldown = 10 * 1000; // 1 minute
  const maxCooldown = 60 * 60 * 1000; // 1 hour

  if (resendCount >= 5) {
    // If user hits 5 resends → max cooldown 1 hour
    return maxCooldown;
  }

  // Otherwise → exponential cooldown (1 min, 2 min, 3 min, etc.)
  return baseCooldown * resendCount;
};

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
