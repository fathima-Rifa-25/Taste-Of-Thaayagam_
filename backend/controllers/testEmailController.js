import nodemailer from 'nodemailer';

// Sends a simple test email to the provided address. Uses same transporter logic as forgotPassword.
export const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    let transporter;
    let usingEthereal = false;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      console.log('Test email: using configured SMTP host', process.env.SMTP_HOST);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      usingEthereal = true;
      console.log('Test email: using Ethereal test account');
    }

    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const mailOpts = {
      from,
      to: email,
      subject: 'Test email from Food Delivery backend',
      text: 'This is a test message to verify SMTP settings.',
      html: '<p>This is a <b>test</b> message to verify SMTP settings.</p>'
    };

    const info = await transporter.sendMail(mailOpts);
    let preview;
    if (usingEthereal && nodemailer.getTestMessageUrl && info) {
      preview = nodemailer.getTestMessageUrl(info);
      console.log('Email preview URL:', preview);
    }

    const resp = { success: true, message: 'Test email sent (check inbox/spam)' };
    if (preview) resp.previewUrl = preview;
    res.json(resp);
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, message: 'Error sending test email', error: err.message });
  }
};
