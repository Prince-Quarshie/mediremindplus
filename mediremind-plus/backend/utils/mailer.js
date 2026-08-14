const nodemailer = require('nodemailer');

const buildTransport = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  };

  return nodemailer.createTransport(config);
};

const sendEmail = async ({ to, subject, text, html }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP mail not configured: skipping email send. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and optionally FROM_EMAIL in your backend .env file.');
    return { skipped: true };
  }

  const transporter = buildTransport();

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || smtpUser,
    to,
    subject,
    text,
    html,
  });

  return { skipped: false };
};

module.exports = { sendEmail };
