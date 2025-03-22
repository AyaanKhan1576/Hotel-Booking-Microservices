const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

//adding a new room to the hotel
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

// display all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find().populate('hotel');
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// update the sleected room desc
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

// display room by selected id
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

//findByIdAndUpdate-> builtin mongoose db func