import { ValidationError } from '../errors/AppError.js';

export const signupValidation = (req, res, next) => {
  const { name, email, password, passwordConfirm, verifyMethod = 'otp' } = req.body;
  if (!name?.trim() || !email?.trim() || !password?.trim() || !passwordConfirm?.trim()) {
    return next(new ValidationError('Please provide your name, email, password and password confirmation.'));
  }

  if (verifyMethod !== 'otp' && verifyMethod !== 'link') {
    return next(new ValidationError('verifyMethod must be either `link` or `otp`'));
  }

  next();
};
