import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { HTTP_STATUS, RESPONSE_STATUS } from '../constants/httpConstants.js';

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const user = new User({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = user.generateEmailVerificationToken();
  const otp = user.generateEmailVerificationOTP();

  await user.save();
  console.log(user);
  return res.status(HTTP_STATUS.CREATED).json({
    status: RESPONSE_STATUS.SUCCESS,
    data: { user: user },
  });
});
