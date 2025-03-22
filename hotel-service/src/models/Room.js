// src/models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomno: { 
    type: String, 
    required: [true, "!Enter Room Number!"]
  },
  type: { 
    type: String, 
    required: [true, "!Enter Room Type!"],
    enum: ["Standard", "Deluxe", "Suite"] 
  },
  capacity: { 
    type: Number, 
    required: [true, "!Enter Room Capacity!"],
    min: [1, "Capacity must be at least 1"] 
  },
  price: { 
    type: Number, 
    required: [true, "!Enter Room Price!"],
    min: [0, "Valid Price"] 
  },
  amenities: [String],
  hotel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Hotel", 
    required: [true, "!Enter Room Hotel!"] 
  },
  // New field: availableDates stores an array of date strings (e.g. "2025-06-01")
  availableDates: { 
    type: [String], 
    default: [] 
  }
});

module.exports = mongoose.model('Room', RoomSchema);
