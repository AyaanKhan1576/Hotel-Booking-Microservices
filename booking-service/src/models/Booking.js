const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  bookingDate: { type: Date, default: Date.now },
  additionalServices: {
    breakfast: { type: Boolean, default: false },
    airportTransport: { type: Boolean, default: false },
    specialAccommodations: { type: String, default: '' },
  },
  paymentStatus: { type: String, default: 'Pending' }, // or "Success"
});

module.exports = mongoose.model('Booking', BookingSchema);
