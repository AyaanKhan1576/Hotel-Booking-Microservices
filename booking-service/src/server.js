// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');

const bookingRoutes      = require('./routes/bookingRoutes');
const groupBookingRoutes = require('./routes/groupBookingRoutes');
const feedbackRoutes     = require('./routes/feedbackRoutes');
const app = express();

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/bookings',      bookingRoutes);
app.use('/api/group-bookings', groupBookingRoutes);
app.use('/api/feedback',       feedbackRoutes);

// Handle 404 for unmatched routes
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not Found' });
});

// Cron job to update room availability hourly
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    await mongoose.model('Room').updateMany(
      { bookedUntil: { $lt: now }, isAvailable: false },
      { $set: { isAvailable: true }, $unset: { bookedUntil: 1, currentBooking: 1 } }
    );
    console.log('Room availability updated');
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Booking Service MongoDB connected');
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
