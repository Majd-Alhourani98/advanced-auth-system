const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const { HTTP_STATUS, RESPONSE_STATUS } = require('../constants/httpConstants');
const sanitizeUser = require('../utils/sanitizeUser');

const signup = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  const user = await User.create({ name, email, password, passwordConfirm });

  return res.status(HTTP_STATUS.CREATED).json({
    status: RESPONSE_STATUS.SUCCESS,
    data: { user: user },
  });
});

module.exports = { signup };
