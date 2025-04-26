// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check for token in headers or cookies
    let token = req.header('Authorization');
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    token = token.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ 
      message: 'Please authenticate',
      error: err.message 
    });
  }
};

module.exports = auth;