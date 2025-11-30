import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// transporter.verify((err, success) => {
//   if (err) console.error('💥Transporter error:', err);
//   else console.log('Transporter is ready:', success);
// });

export default transporter;
