const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const { HTTP_STATUS, RESPONSE_STATUS } = require('../constants/httpConstants');
const { ValidationError } = require('../errors/AppError');

const signup = catchAsync(async (req, res, next) => {
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

module.exports = { signup };
