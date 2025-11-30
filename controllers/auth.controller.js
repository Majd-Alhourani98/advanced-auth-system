import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { RESPONSE_STATUS, HTTP_STATUS } from '../constants/httpConstants.js';
import { sendVerificationEmail } from '../email/sendEmail.js';

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, verifyMethod = 'otp' } = req.body;

  const user = new User({ name, email, password, passwordConfirm });

  const { message, token, otp } = user.applyVerificationMethod(verifyMethod);

  await user.save();

  await sendVerificationEmail(user, verifyMethod, token, otp);

  res.status(HTTP_STATUS.CREATED).json({
    status: RESPONSE_STATUS.SUCCESS,
    message,
    data: { user },
    token: token || null,
    otp: otp || null,
  });
});
