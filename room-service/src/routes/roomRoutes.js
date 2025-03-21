const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET /api/rooms - Retrieve all rooms
router.get('/', roomController.getAllRooms);

// GET /api/rooms/:id - Retrieve a specific room by ID
router.get('/:id', roomController.getRoomById);

module.exports = router;
