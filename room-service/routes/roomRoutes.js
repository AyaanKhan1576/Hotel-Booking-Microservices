const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET /rooms - list all rooms
router.get('/', roomController.getAllRooms);

// GET /rooms/:id - get details of a room (if needed)
router.get('/:id', roomController.getRoomById);

module.exports = router;
