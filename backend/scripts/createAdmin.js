import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

const run = async () => {
  try {
    await connectDB();
    const existing = await userModel.findOne({ email: EMAIL });
    if (existing) {
      console.log(`User ${EMAIL} already exists. isAdmin=${existing.isAdmin}`);
      if (!existing.isAdmin) {
        existing.isAdmin = true;
        await existing.save();
        console.log('User promoted to admin.');
      }
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(PASSWORD, salt);

    const newUser = new userModel({
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      email: EMAIL,
      password: hashed,
      isAdmin: true,
    });

    await newUser.save();
    console.log(`Admin user created: ${EMAIL} / ${PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

run();
