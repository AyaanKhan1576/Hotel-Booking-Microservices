const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/search', bookingController.getUserBookings);
router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.cancelBooking);
router.patch('/:id/payment', bookingController.processPayment);

// Loyalty points route
router.post('/loyalty/award', bookingController.awardLoyaltyPoints);

module.exports = router;