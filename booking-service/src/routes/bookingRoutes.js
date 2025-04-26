// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/feedback', bookingController.submitFeedback);
router.get('/search', bookingController.getUserBookings);
router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.cancelBooking);
router.patch('/:id/payment', bookingController.processPayment);
router.post('/loyalty/award', bookingController.awardLoyaltyPoints);

router.get('/feedback/:bookingId', bookingController.getFeedback);
module.exports = router;
