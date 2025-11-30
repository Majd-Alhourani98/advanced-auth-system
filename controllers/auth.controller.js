import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { RESPONSE_STATUS, HTTP_STATUS } from '../constants/httpConstants.js';

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, verifyMethod } = req.body;

  const user = new User({ name, email, password, passwordConfirm });

  const message = user.applyVerificationMethod(user, verifyMethod);

  await user.save();

  return res.status(HTTP_STATUS.CREATED).json({
    status: RESPONSE_STATUS.SUCCESS,
    data: { user: user },
    message: message,
  });
});
