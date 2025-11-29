const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

const signup = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  const user = await User.create({ name, email, password, passwordConfirm });

  return res.status(201).json({
    status: 'success',
    data: { user: user },
  });
});

module.exports = { signup };
