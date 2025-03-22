// src/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// Add a new room to a hotel
router.post('/', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    await Hotel.findByIdAndUpdate(room.hotel, { $push: { rooms: room._id } });
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Display all rooms with optional filtering/sorting
router.get('/', async (req, res) => {
  try {
    const { amenities, capacity, sortBy } = req.query;
    const query = {};
    if (amenities) {
      query.amenities = { $all: amenities.split(',') };
    }
    if (capacity) {
      query.capacity = { $eq: parseInt(capacity) };
    }
    const sortOptions = {};
    if (sortBy === 'price_asc') sortOptions.price = 1;
    else if (sortBy === 'price_desc') sortOptions.price = -1;
    const rooms = await Room.find(query).populate('hotel').sort(sortOptions);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update room details (for example, updating availableDates)
router.put('/:id', async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    await Hotel.findByIdAndUpdate(room.hotel, { $pull: { rooms: room._id } });
    res.json({ message: "Room removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
