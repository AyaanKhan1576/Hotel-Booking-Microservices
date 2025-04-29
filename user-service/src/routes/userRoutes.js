const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/users', auth, userController.getAllUsers);
router.put('/users/:id', auth, userController.updateUser);
router.delete('/users/:id', auth, userController.deleteUser);



// Loyalty program routes
router.post('/users/loyalty/enroll', auth, userController.enrollLoyalty);
router.get('/users/loyalty/status', auth, userController.getLoyaltyStatus);
router.post('/users/loyalty/redeem', userController.redeemLoyaltyReward); // No auth, used by booking service

module.exports = router;