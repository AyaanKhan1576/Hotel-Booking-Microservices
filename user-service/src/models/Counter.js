// src/models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "userId"
  sequence_value: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);
