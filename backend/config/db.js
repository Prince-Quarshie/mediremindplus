const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, opts);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`⚠️ MongoDB Connection Warning: ${err.message}`);
    if (err.message.includes('whitelist') || err.message.includes('SSL') || err.message.includes('selection')) {
      console.error('👉 TIP: Ensure your IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas -> Network Access.');
    }
  }
};

mongoose.connection.on('connected', () => console.log('🟢 Mongoose connected to MongoDB'));
mongoose.connection.on('disconnected', () => console.warn('🟡 Mongoose disconnected from MongoDB'));
mongoose.connection.on('reconnected', () => console.log('🟢 Mongoose reconnected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('🔴 Mongoose error:', err.message));

module.exports = connectDB;
