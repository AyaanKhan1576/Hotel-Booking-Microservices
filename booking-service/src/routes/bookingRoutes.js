const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /bookings - create a new booking
router.post('/', bookingController.createBooking);

// GET /bookings/:id - get a booking confirmation (if needed)
router.get('/:id', bookingController.getBookingById);

module.exports = router;
