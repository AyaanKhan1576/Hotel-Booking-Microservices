const mongoose = require('mongoose');

const PriceChangeLogSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  // changedBy can be used to store the identifier (email or ID) of the admin making the change.
  changedBy: { type: String, default: "Unknown" },
  changedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PriceChangeLog', PriceChangeLogSchema);
