const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Connect to MongoDB Atlas using Mongoose.
 * This function is called in server.js to establish DB connection.
 * For ChainCred MVP: Uses MongoDB Atlas for storing users and certificates.
 * Error handling: Logs connection status; throws error if connection fails.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit process with failure for MVP; adjust for production
  }
};

module.exports = connectDB;
