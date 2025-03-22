const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// adding a new room to a hotel
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

// displaying all rooms a s per the search and filter opt
router.get('/', async (req, res) => {
    try {
        const { amenities, capacity, sortBy } = req.query;

        const query = {};
        //amenities filter
        if (amenities) {
            query.amenities = { $all: amenities.split(',') }; 
        }
        //capacity filter-> exactly equal to val -> $eq
        if (capacity) {
            query.capacity = { $eq: parseInt(capacity) }; 
        }

        const sortOptions = {};
        //sort by low to high
        if (sortBy === 'price_asc') {
            sortOptions.price = 1; 
        }
        //sort by high to low
        else if (sortBy === 'price_desc') {
            sortOptions.price = -1; 
        }

        const rooms = await Room.find(query)
            .populate('hotel')
            .sort(sortOptions);

        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// update the selected room description
router.put('/:id', async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRoom);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// delete a selected room
router.delete('/:id', async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        await Hotel.findByIdAndUpdate(room.hotel, { $pull: { rooms: room._id } });
        res.json({ message: "Room removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// display room by selected ID
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