const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/groupBookingController');

// US05.1: create and list
router.post('/', ctrl.createGroupBooking);
router.get('/', ctrl.getAgentGroupBookings);

// US05.2: update single assignment
router.put('/:groupId/rooms/:roomId', ctrl.updateRoomAssignment);

// US05.3: update discount
router.patch('/:groupId/discount', ctrl.updateDiscount);

module.exports = router;
