export const generateLinkEmailTemplate = ({ name, token, email }) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif; background:#f6f9fc; padding:40px;">
  <div style="max-width:520px; margin:auto; background:#fff; padding:32px; border-radius:14px;">

    <h2 style="text-align:center; color:#4a4a4a; margin-bottom:8px;">Welcome Aboard!</h2>
    <p style="text-align:center; color:#666; margin-bottom:24px;">Just one more step to get started</p>

    <p style="font-size:16px; color:#333; margin-bottom:20px;">
      Hi <strong>${name}</strong>, please verify your email to activate your account.
    </p>

    <div style="text-align:center; margin-bottom:32px;">
      <a href="http://localhost:3000/api/v1/auth/verifiy?token=${token}&email=${email}"
         style="background:#667eea; color:#fff; padding:14px 40px; font-weight:600; 
                text-decoration:none; border-radius:40px; display:inline-block;">
        Verify Email
      </a>
    </div>

    <p style="font-size:13px; color:#444; margin:0 0 6px;">If the button doesn't work, use this link:</p>
    <p style="font-size:12px; color:#667eea; word-break:break-all; margin-bottom:24px;">
      http://localhost:3000/api/v1/auth/verifiy?token=${token}&email=${email}
    </p>

    <p style="background:#fff5f5; color:#742a2a; padding:14px; border-radius:8px; font-size:13px; margin-bottom:28px;">
      If you didn’t create an account, you can safely ignore this email.
    </p>

    <p style="text-align:center; font-size:12px; color:#aaa;">
      © ${new Date().getFullYear()} Your Company
    </p>

  </div>
</body>
</html>
`;
