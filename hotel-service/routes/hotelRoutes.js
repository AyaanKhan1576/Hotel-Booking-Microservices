const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');     //for room associated w hotels

// adding a new hotel to the db
router.post('/', async (req, res) => {
    try {
        const hotel = new Hotel(req.body);
        await hotel.save();
        res.status(201).json(hotel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// display all hotels 
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, sort, location } = req.query;
        const query = location ? { location: new RegExp(location, 'i') } : {};

        const hotels = await Hotel.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort || '-createdAt')
            .populate('rooms');

        res.json(hotels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// update the selected hotel
router.put('/:id', async (req, res) => {
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedHotel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// delete the selected hotel
router.delete('/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ error: "Hotel not found" });

        // cascadde delete -> delete the related rooms too
        await Room.deleteMany({ hotel: hotel._id });

        await Hotel.findByIdAndDelete(req.params.id);
        res.json({ message: "Hotel and all associated rooms removed" });
    } catch (err) {
        console.error('Error deleting hotel:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//display hotel by selected id
router.get('/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('rooms');
        if (!hotel) return res.status(404).json({ error: "Hotel not found" });
        res.json(hotel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;