require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const bookingRoutes = require('./routes/bookingRoutes');
const groupBookingRoutes = require('./routes/groupBookingRoutes');
app.use('/api/bookings', bookingRoutes);
app.use('/api/group-bookings', require('./routes/groupBookingRoutes'));

const PORT = process.env.PORT || 5002;

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    await Room.updateMany(
      { bookedUntil: { $lt: now }, isAvailable: false },
      { $set: { isAvailable: true }, $unset: { bookedUntil: 1, currentBooking: 1 } }
    );
    console.log('Room availability updated');
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Booking Service MongoDB connected");
    app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
  })
  .catch(err => console.error(err));
