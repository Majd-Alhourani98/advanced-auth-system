import cron from 'node-cron';

import mongoose from 'mongoose';
import buildDatabaseURI from '../utils/buildDatabaseURI.js';
import User from '../models/user.model.js';

// Localhost MongoDB connection
const DB_URI = 'mongodb://127.0.0.1:27017/auth_db';

const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_URL } = process.env;
// const DB_URI = buildDatabaseURI(DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_URL);

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    cron.schedule('0 */6 * * *', async () => {
      try {
        const result = await User.deleteMany({ isEmailVerified: false });
        console.log(`Cleanup finished. Deleted ${result.deletedCount} zombie accounts.`);
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
