const mongoose = require('mongoose');

// Connect to MongoDB Atlas.
// We keep retry logic minimal here -- mongoose handles reconnects internally
// once the initial connection is established.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // these are sane defaults; mongoose 7+ doesn't need most legacy options
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
