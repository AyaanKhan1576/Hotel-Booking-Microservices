const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/bookingservice', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Booking Service MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
