const Room = require('../models/room');

// Fetch all room details
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Fetch a specific room by ID (if needed)
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ msg: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
