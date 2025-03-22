const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: { type: String, required: [true, "!Enetr Hotel name!"] },
    location: { type: String, required: [true, "!Enetr Location!"] },
    contactInfo: { type: String, required: [true, "!Enetr Hotel Contact!"] },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }]
});

module.exports = mongoose.model('Hotel', HotelSchema);
