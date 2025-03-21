// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./Counter'); // Import the counter model

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true }, // Auto-incrementing integer ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'hotelManagement', 'travelAgent', 'admin'], 
    default: 'user' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook: Auto-increment userId and hash password if modified.
userSchema.pre('save', async function(next) {
  // Only assign a new userId if this is a new document and userId isn't set
  if (this.isNew && !this.userId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.userId = counter.sequence_value;
    } catch (err) {
      return next(err);
    }
  }

  // If password is modified, hash it
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
