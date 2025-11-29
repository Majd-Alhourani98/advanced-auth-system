import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { HTTP_STATUS, RESPONSE_STATUS } from '../constants/httpConstants.js';
import { ValidationError } from '../errors/AppError.js';

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  if (!name || !email || !password || !passwordConfirm) {
    return next(new ValidationError('Please provide your name, email, password and password confirmation.'));
  }

  const user = await User.create({ name, email, password, passwordConfirm });

  return res.status(HTTP_STATUS.CREATED).json({
    status: RESPONSE_STATUS.SUCCESS,
    data: { user: user },
  });
});
