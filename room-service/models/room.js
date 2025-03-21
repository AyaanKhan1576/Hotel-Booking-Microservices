const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  images: [String],
  pricing: { type: Number, required: true },
  availableDates: [Date],
});

module.exports = mongoose.model('Room', RoomSchema);
