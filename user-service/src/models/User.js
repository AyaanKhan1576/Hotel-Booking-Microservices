const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'hotelManagement', 'travelAgent', 'admin'], 
    default: 'user' 
  },
  favorites: [{
    itemId: { type: Number, required: true },
    type: { type: String, enum: ['hotel', 'room'], required: true }
  }],
  loyalty: {
    isMember: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    coupons: [{
      code: { type: String, required: true },
      discountPercentage: { type: Number, required: true }, // e.g., 10 for 10% off
      expiryDate: { type: Date, required: true },
      used: { type: Boolean, default: false }
    }],
    tier: { 
      type: String, 
      enum: ['Bronze', 'Silver', 'Gold'], 
      default: 'Bronze' 
    }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
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

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);