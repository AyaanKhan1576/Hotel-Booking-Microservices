const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Ensure the search route is defined before the parameterized route (if you have one)
router.get('/search', bookingController.getUserBookings);

// POST route to create a new booking
router.post('/', bookingController.createBooking);

// GET, PUT, DELETE routes using /:id
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
