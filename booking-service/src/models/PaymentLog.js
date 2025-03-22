// booking-service/models/PaymentLog.js
const mongoose = require('mongoose');

const PaymentLogSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  transactionStatus: { type: String, required: true }, // e.g., "Success" or "Failed"
  processedAt: { type: Date, default: Date.now },
  details: { type: String, default: "" }  // Optional: additional transaction details
});

module.exports = mongoose.model('PaymentLog', PaymentLogSchema);
