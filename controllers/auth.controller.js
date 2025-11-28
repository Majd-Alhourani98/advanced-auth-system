const User = require('../models/user.model');

const signup = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  try {
    const user = await User.create({ name, email, password, passwordConfirm });

    return res.status(201).json({
      status: 'success',
      data: { user: user },
    });
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

module.exports = { signup };
