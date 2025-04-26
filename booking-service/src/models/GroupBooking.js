const mongoose = require('mongoose');

const RoomAssignmentSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guestName: String,
  guestEmail: String,
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ['Booked','Cancelled'], default: 'Booked' }
});

const GroupBookingSchema = new mongoose.Schema({
  agentEmail: { type: String, required: true },
  rooms: [RoomAssignmentSchema],
  discountRate: { type: Number, default: 0 },   // e.g. 10 = 10%
  totalPrice: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupBooking', GroupBookingSchema);
