// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Public routes for registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected favorites routes
router.post('/favorites', auth, userController.addFavorite);
router.delete('/favorites', auth, userController.removeFavorite);
router.get('/favorites', auth, userController.getFavorites);

// Admin routes for account management
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
