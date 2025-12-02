export const generateOtpEmailTemplate = ({ name, otp }) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background:#f6f9fc; padding:40px;">
  <div style="max-width:500px; margin:auto; background:white; border-radius:12px; padding:32px;">
    <h2 style="text-align:center; margin-bottom:20px; color:#4a4a4a;">Your Verification Code</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your OTP is:</p>
    <div style="text-align:center; font-size:32px; font-weight:bold; letter-spacing:6px; padding:20px; background:#667eea; color:white; border-radius:8px;">
      ${otp}
    </div>
    <p style="margin-top:24px; font-size:14px; color:#555;">
      This code is valid for 5 minutes. Do not share it with anyone.
    </p>
    <p style="font-size:12px; color:#999; text-align:center; margin-top:32px;">
      © ${new Date().getFullYear()} Your Company
    </p>
  </div>
</body>
</html>
`;
