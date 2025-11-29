const sanitizeUser = user => {
  const sanitized = { ...user._doc }; // convert mongoose document into a plain object

  delete sanitized.password;
  delete sanitized.emailVerificationToken;
  delete sanitized.emailVerificationTokenExpires;
  delete sanitized.passwordResetToken;
  delete sanitized.passwordResetExpires;
  delete sanitized.emailVerificationOTP;
  delete sanitized.emailVerificationOTPExpires;

  return sanitized;
};

module.exports = sanitizeUser;
