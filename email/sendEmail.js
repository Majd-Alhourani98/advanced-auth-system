import transporter from '../config/email.js';

const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `'My App' <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    // html
  });
};

export const sendVerificationEmail = async (user, verifyMethod, token, otp) => {
  try {
    const emailOptions = {
      to: user.email,
      subject: 'Verify your email',
      text:
        verifyMethod === 'link'
          ? `Click this link to verify your email: ${process.env.FRONTEND_URL}/api/v1/verify-email?token=${token}&email=${user.email}`
          : `Your OTP for email verification is: ${otp}`,
    };

    await sendEmail(emailOptions);
  } catch (error) {
    // 5️⃣ Rollback verification fields if email fails
    [
      'emailVerificationOTP',
      'emailVerificationOTPExpires',
      'emailVerificationToken',
      'emailVerificationTokenExpires',
    ].forEach(field => (user[field] = undefined));

    console.log(error);
    await user.save({ validateBeforeSave: false });
  }
};
