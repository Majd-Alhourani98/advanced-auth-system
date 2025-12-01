import transporter from '../config/email.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const sendEmailWithRetry = async (options, retries = 3, delay = 2000) => {
  for (let attempts = 1; attempts <= retries; attempts++) {
    try {
      await sendEmail(options);
      console.log('Email sent successfully');
      return true; // stop retrying if successful
    } catch (error) {
      console.log(`Attempt ${attempts} failed: ${error.message}`);
      if (attempts === retries) {
        console.log('Failed to send email after all retries');
        return false;
      }
    }

    //   await new Promise(resolve => setTimeout(resolve, delay));
    await sleep(delay);
  }
};

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
  const emailOptions = {
    to: user.email,
    subject: 'Verify your email',
    text:
      verifyMethod === 'link'
        ? `Click this link to verify your email: ${process.env.FRONTEND_URL}/api/v1/verify-email?token=${token}&email=${user.email}`
        : `Your OTP for email verification is: ${otp}`,
  };

  const success = await sendEmailWithRetry(emailOptions);
  if (!success) {
    [
      'emailVerificationOTP',
      'emailVerificationOTPExpires',
      'emailVerificationToken',
      'emailVerificationTokenExpires',
    ].forEach(field => (user[field] = undefined));

    await user.save({ validateBeforeSave: false });
  }
};
