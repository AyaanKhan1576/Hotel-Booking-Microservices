const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST route for creating a booking
router.post('/', bookingController.createBooking);

// GET route for retrieving a booking by ID
router.get('/:id', bookingController.getBookingById);

module.exports = router;
