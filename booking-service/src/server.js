require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);
app.use('/api/group-bookings', require('./routes/groupBookingRoutes'));

const PORT = process.env.PORT || 5002;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Booking Service MongoDB connected");
    app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
  })
  .catch(err => console.error(err));
