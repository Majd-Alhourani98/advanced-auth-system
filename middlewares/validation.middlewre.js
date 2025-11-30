import { ValidationError } from '../errors/AppError.js';

export const signupValidation = (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  if (!name?.trim() || !email?.trim() || !password?.trim() || !passwordConfirm?.trim()) {
    return next(new ValidationError('Please provide your name, email, password and password confirmation.'));
  }

  next();
};
