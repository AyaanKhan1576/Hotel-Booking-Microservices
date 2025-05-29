const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

// Generate a random coupon code
const generateCouponCode = () => {
  return 'CPN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// US07.1: Enroll in loyalty program
exports.enrollLoyalty = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.loyalty.isMember) {
      return res.status(400).json({ message: 'User is already a loyalty member' });
    }

    user.loyalty.isMember = true;
    user.loyalty.points = 0;
    user.loyalty.tier = 'Bronze';
    // Grant a welcome coupon (e.g., 5% off, expires in 30 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    user.loyalty.coupons.push({
      code: generateCouponCode(),
      discountPercentage: 5,
      expiryDate
    });

    await user.save();
    await AuditLog.create({
      adminId: null,
      action: 'loyalty_enroll',
      targetUserId: user.userId,
      oldData: { loyalty: { isMember: false } },
      newData: { loyalty: user.loyalty }
    });

    res.json({ message: 'Successfully enrolled in loyalty program', loyalty: user.loyalty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// US07.2: Get loyalty status and rewards
exports.getLoyaltyStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      isMember: user.loyalty.isMember,
      points: user.loyalty.points,
      coupons: user.loyalty.coupons.filter(c => !c.used && c.expiryDate > new Date()),
      tier: user.loyalty.tier
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// US07.3: Redeem loyalty points or coupon (called by booking service)
exports.redeemLoyaltyReward = async (req, res) => {
  try {
    const { email, points, couponCode } = req.body;
    if (!points && !couponCode) {
      return res.status(400).json({ message: 'Must provide points or couponCode' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.loyalty.isMember) {
      return res.status(400).json({ message: 'User is not a loyalty member' });
    }

    let discount = 0;
    let message = '';

    if (points) {
      if (points > user.loyalty.points) {
        return res.status(400).json({ message: 'Insufficient points' });
      }
      // Assume 1 point = $1 discount
      discount = points;
      user.loyalty.points -= points;
      message = `Redeemed ${points} points for $${discount} discount`;
    } else if (couponCode) {
      const coupon = user.loyalty.coupons.find(c => c.code === couponCode && !c.used && c.expiryDate > new Date());
      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }
      discount = coupon.discountPercentage; // Percentage discount
      coupon.used = true;
      message = `Redeemed coupon ${couponCode} for ${discount}% discount`;
    }

    await user.save();
    await AuditLog.create({
      adminId: null,
      action: 'loyalty_redeem',
      targetUserId: user.userId,
      oldData: { loyalty: { points: user.loyalty.points + (points || 0), coupons: user.loyalty.coupons } },
      newData: { loyalty: user.loyalty }
    });

    res.json({ message, discount, isPercentage: !!couponCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Existing functions (unchanged)
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

exports.updateUser = async (req, res) => {
  try {
    const identifier = req.params.id;
    let query;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else {
      query = { userId: parseInt(identifier, 10) };
    }

    const oldUser = await User.findOne(query).lean();
    if (!oldUser) return res.status(404).json({ message: 'User not found' });

    const user = await User.findOneAndUpdate(query, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

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

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findOneAndDelete(query);

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

// Updated addFavorite
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { itemId, type } = req.body;

    if (!['hotel', 'room'].includes(type)) {
      return res.status(400).json({ message: 'Invalid favorite type' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = user.favorites.some(fav => fav.itemId === itemId && fav.type === type);
    if (exists) return res.status(400).json({ message: 'Item already in favorites' });

    user.favorites.push({ itemId, type });
    await user.save();
    res.json({ message: 'Favorite added', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Updated removeFavorite
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { type } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(fav => !(fav.itemId.toString() === itemId && fav.type === type));
    
    if (user.favorites.length === initialLength) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await user.save();
    res.json({ message: 'Favorite removed', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Updated getFavorites
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};