// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');


router.post('/', bookingController.submitFeedback);

router.get('/:bookingId', bookingController.getFeedback);


module.exports = router;
