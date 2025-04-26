// src/controllers/userController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: user.userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, userId: user.userId, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user and log the change
exports.updateUser = async (req, res) => {
  try {
    const identifier = req.params.id;
    let query;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      query = { userId: parseInt(identifier, 10) };
    }

    // Fetch the current (old) data
    const oldUser = await User.findOne(query).lean();
    if (!oldUser) return res.status(404).json({ message: 'User not found' });

    const user = await User.findOneAndUpdate(query, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Log the update action.
    // Use req.user if available; otherwise, set to null.
    const adminId = req.user ? req.user._id : null;
    await AuditLog.create({
      adminId: adminId,
      action: 'update',
      targetUserId: user.userId,
      oldData: oldUser,
      newData: user.toObject()
    });

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const identifier = req.params.id;
    let query;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      query = { userId: parseInt(identifier, 10) };
    }

    // Fetch user data before deletion
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findOneAndDelete(query);

    // Log the deletion action.
    const adminId = req.user ? req.user._id : null;
    await AuditLog.create({
      adminId: adminId,
      action: 'delete',
      targetUserId: user.userId,
      oldData: user.toObject(),
      newData: null
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// src/controllers/userController.js
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, type } = req.body;

    if (!['hotel', 'room'].includes(type)) {
      return res.status(400).json({ message: 'Invalid favorite type' });
    }

    const user = await User.findById(userId);
    const exists = user.favorites.some(fav => fav.itemId === itemId && fav.type === type);
    if (exists) return res.status(400).json({ message: 'Item already in favorites' });

    user.favorites.push({ itemId, type });
    await user.save();
    res.json({ message: 'Favorite added', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, type } = req.body;

    const user = await User.findById(userId);
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(fav => !(fav.itemId === itemId && fav.type === type));
    
    if (user.favorites.length === initialLength) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await user.save();
    res.json({ message: 'Favorite removed', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};