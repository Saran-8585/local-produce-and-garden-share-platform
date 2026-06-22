const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/local_produce';

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully');
}

module.exports = { connectDB };
