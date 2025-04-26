// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST   /api/feedback?email=…      → submit or update feedback
router.post('/', bookingController.submitFeedback);

// GET    /api/feedback/:bookingId?email=…  → fetch feedback
router.get('/:bookingId', bookingController.getFeedback);


module.exports = router;
