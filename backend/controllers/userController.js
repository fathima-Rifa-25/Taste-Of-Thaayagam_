import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ========================
// USER AUTH FUNCTIONS
// ========================

// Register user
const registerUser = async (req, res) => {
  const { firstName, lastName, name, email, password, phone } = req.body;
  // Support either firstName/lastName or legacy name
  const finalName = name || ((firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : '');
  try {
    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    if (!finalName || !email || !password)
      return res.json({ success: false, message: "All fields are required" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({ firstName, lastName, name: finalName, email, phone, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error registering user" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Incorrect password" });

    // include isAdmin flag in token payload and response
    const token = jwt.sign({ id: user._id, isAdmin: !!user.isAdmin }, process.env.JWT_SECRET || "secret123", { expiresIn: "1d" });

res.json({ 
  success: true, 
  token, 
  user: { id: user._id, firstName: user.firstName, lastName: user.lastName, name: user.name, email: user.email, phone: user.phone, isAdmin: !!user.isAdmin }, 
  message: "Login successful" 
});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error logging in" });
  }
};

// ========================
// ADMIN FUNCTIONS
// ========================

// Fetch all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, { firstName: 1, lastName: 1, name: 1, email: 1, phone: 1, _id: 1 }); // include name parts and _id
    res.json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching users" });
  }
};

// Add new user (admin)
const createUserByAdmin = async (req, res) => {
  const { firstName, lastName, name, email, password, phone } = req.body;
  const finalName = name || ((firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : '');
  try {
    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({ firstName, lastName, name: finalName, email, phone, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "User added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding user" });
  }
};

// Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting user" });
  }
};

// Update user (admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
  const { firstName, lastName, name, email, password, phone } = req.body;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updated = await userModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully", data: updated });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating user" });
  }
};

// ========================
// EXPORTS
// ========================
export { registerUser, loginUser, getAllUsers, createUserByAdmin, deleteUser, updateUser };

// ========================
// PASSWORD RESET
// ========================

// Request a password reset - creates a token and (in production) would email it.
import nodemailer from 'nodemailer';

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: 'Email required' });
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // Prepare transporter - prefer real SMTP from env, fallback to ethereal for dev
    let transporter;
    let usingEthereal = false;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      console.log('Password reset: using configured SMTP host', process.env.SMTP_HOST);
    } else {
      // create ethereal test account for dev
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      usingEthereal = true;
      console.log('Password reset: using Ethereal test account for email preview');
    }

    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOpts = {
      from,
      to: user.email,
      subject: 'Password reset code',
      text: `You requested a password reset. Use the following code to reset your password: ${token}\n\nIf you didn't request this, ignore this email.`,
      html: `<p>You requested a password reset. Use the following code to reset your password:</p><pre style="background:#f4f4f4;padding:10px;border-radius:4px">${token}</pre><p>If you didn't request this, ignore this email.</p>`
    };

    const info = await transporter.sendMail(mailOpts);
    // For ethereal/dev preview, log the preview URL for convenience
    let preview;
    if (usingEthereal && nodemailer.getTestMessageUrl && info) {
      preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('Preview URL for reset email:', preview);
    }

    const resp = { success: true, message: 'Reset token created and emailed if the account exists' };
    if (preview) resp.previewUrl = preview;
    res.json(resp);
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error creating reset token' });
  }
};

// Reset password using token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) return res.json({ success: false, message: 'Token and password required' });
    const user = await userModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.json({ success: false, message: 'Token invalid or expired' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error resetting password' });
  }
};

export { forgotPassword, resetPassword };

// Promote user to admin (dev helper)
const promoteUser = async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
    const expected = process.env.ADMIN_PROMOTE_KEY || 'dev_promote_key';
    if (adminKey !== expected) return res.json({ success: false, message: 'Unauthorized' });

    const { email } = req.body;
    if (!email) return res.json({ success: false, message: 'Email required' });

    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    user.isAdmin = true;
    await user.save();

    res.json({ success: true, message: 'User promoted to admin' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error promoting user' });
  }
};

export { promoteUser };

// Debug: list users (protected by admin promote key)
const listUsersDebug = async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    const expected = process.env.ADMIN_PROMOTE_KEY || 'dev_promote_key';
    if (adminKey !== expected) return res.json({ success: false, message: 'Unauthorized' });

    const users = await userModel.find({}, { password: 0 });
    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error listing users' });
  }
};

export { listUsersDebug };
