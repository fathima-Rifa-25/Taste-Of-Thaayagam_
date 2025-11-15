import nodemailer from 'nodemailer';
import 'dotenv/config';

async function send() {
  try {
    const to = process.argv[2];
    if (!to) {
      console.error('Usage: node sendTestEmail.js recipient@example.com');
      process.exit(1);
    }

    let transporter;
    let usingEthereal = false;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      console.log('Using configured SMTP host', process.env.SMTP_HOST);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      usingEthereal = true;
      console.log('Using Ethereal test account');
    }

    const mailOpts = {
      from: process.env.FROM_EMAIL || 'no-reply@example.com',
      to,
      subject: 'Test SMTP Email',
      text: 'This is a test message from sendTestEmail.js',
      html: '<p>This is a test message from <b>sendTestEmail.js</b></p>'
    };

    const info = await transporter.sendMail(mailOpts);
    console.log('Message sent:', info.messageId);
    if (usingEthereal && nodemailer.getTestMessageUrl) {
      const preview = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', preview);
    }
    process.exit(0);
  } catch (err) {
    console.error('Send test email error:', err);
    process.exit(2);
  }
}

send();
