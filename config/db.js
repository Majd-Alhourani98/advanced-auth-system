const mongoose = require('mongoose');

// Localhost MongoDB connection
const DB_URI = 'mongodb://127.0.0.1:27017/auth_db';

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
