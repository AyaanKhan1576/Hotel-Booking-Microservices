const axios = require('axios');
const GroupBooking = require('../models/GroupBooking');
const Booking = require('../models/Booking');

// Helper: Generate an array of date strings (YYYY-MM-DD)
const getDatesBetween = (start, end) => {
  const dates = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current < last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Helper: sum up room prices * nights
const calculateTotal = async (rooms, discountRate) => {
  let sum = 0;
  for (const r of rooms) {
    const res = await axios.get(`${process.env.ROOM_SERVICE_URL || 'http://localhost:5000'}/api/rooms/${r.roomId}`);
    const room = res.data;
    const nights = (new Date(r.checkOut) - new Date(r.checkIn)) / (1000 * 60 * 60 * 24);
    sum += room.price * nights;
  }
  return sum * (1 - discountRate / 100);
};

// Simulated notification function
const sendNotification = async (guestEmail, subject, message) => {
  console.log(`Notification sent to ${guestEmail}:\nSubject: ${subject}\nMessage: ${message}`);
};

// US05.1: Create a new group booking
exports.createGroupBooking = async (req, res) => {
  try {
    const { agentEmail, rooms, discountRate } = req.body;

    // Validate input
    if (!agentEmail || !rooms || rooms.length === 0) {
      return res.status(400).json({ error: 'Agent email and at least one room are required' });
    }

    // Generate the array of dates to be booked for each room
    const bookingPromises = rooms.map(async (room) => {
      try {
        const bookingDates = getDatesBetween(room.checkIn, room.checkOut);

        // Get room details from the hotel-service
        const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
        const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${room.roomId}`);
        const roomData = roomResponse.data;
        if (!roomData) {
          throw new Error(`Room ${room.roomId} not found`);
        }

        // Check if every booking date is available
        const availableDates = roomData.availableDates || [];
        const allDatesAvailable = bookingDates.every(date => availableDates.includes(date));
        if (!allDatesAvailable) {
          throw new Error(`Some or all dates are not available for room ${room.roomId}`);
        }

        // Create individual booking
        const bookingData = {
          roomId: room.roomId,
          guestName: room.guestName,
          guestEmail: room.guestEmail,
          checkIn: new Date(room.checkIn),
          checkOut: new Date(room.checkOut),
          additionalServices: {},
          paymentStatus: 'Pending'
        };
        const booking = new Booking(bookingData);
        await booking.save();

        // Update room availability
        const updatedAvailableDates = availableDates.filter(date => !bookingDates.includes(date));
        await axios.put(`${roomServiceUrl}/api/rooms/${room.roomId}`, { availableDates: updatedAvailableDates });

        // Send notification to guest
        await sendNotification(room.guestEmail, "Booking Confirmed", "Your booking has been confirmed successfully.");

        return booking._id;
      } catch (error) {
        console.error(`Error processing room ${room.roomId}:`, error.message);
        throw error;
      }
    });

    const bookingIds = await Promise.all(bookingPromises);

    // Create the group booking
    const groupBookingData = {
      agentEmail,
      rooms: rooms.map((room, index) => ({
        roomId: room.roomId,
        guestName: room.guestName,
        guestEmail: room.guestEmail,
        checkIn: new Date(room.checkIn),
        checkOut: new Date(room.checkOut),
        bookingId: bookingIds[index]
      })),
      discountRate,
      totalPrice: await calculateTotal(rooms, discountRate),
      paymentStatus: 'Pending'
    };

    const group = await GroupBooking.create(groupBookingData);

    // Send notification to agent
    await sendNotification(agentEmail, "Group Booking Created", "Your group booking has been created successfully.");

    res.status(201).json(group);
  } catch (err) {
    console.error('Create group booking error:', err.message);
    res.status(500).json({ error: err.message || 'Server Error' });
  }
};

// Other functions remain unchanged
exports.getAgentGroupBookings = async (req, res) => {
  try {
    const { agentEmail } = req.query;
    const groups = await GroupBooking.find({ agentEmail });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateRoomAssignment = async (req, res) => {
  try {
    const { groupId, roomId } = req.params;
    const update = req.body;
    const group = await GroupBooking.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group booking not found' });

    const assignment = group.rooms.id(roomId);
    if (!assignment) return res.status(404).json({ msg: 'Room assignment not found' });
    Object.assign(assignment, update);

    group.totalPrice = await calculateTotal(group.rooms, group.discountRate);
    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { discountRate } = req.body;
    const group = await GroupBooking.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group booking not found' });

    group.discountRate = discountRate;
    group.totalPrice = await calculateTotal(group.rooms, discountRate);
    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};