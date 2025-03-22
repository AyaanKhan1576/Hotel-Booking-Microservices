const axios = require('axios');
const Booking = require('../models/Booking');

// Helper function to generate date strings (YYYY-MM-DD) from check-in (inclusive) to check-out (exclusive)
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

exports.createBooking = async (req, res) => {
  try {
    const { roomId, guestName, guestEmail, checkIn, checkOut, additionalServices } = req.body;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ msg: "Check-in date must be before check-out date." });
    }

    // Generate the requested booking dates
    const bookingDates = getDatesBetween(checkIn, checkOut);

    // Fetch room details from hotel-service
    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${roomId}`);
    const room = roomResponse.data;
    if (!room) {
      return res.status(404).json({ msg: "Room not found." });
    }

    // Check if all requested booking dates are available
    const availableDates = room.availableDates || [];
    const allDatesAvailable = bookingDates.every(date => availableDates.includes(date));
    if (!allDatesAvailable) {
      return res.status(400).json({ msg: "Some or all of the requested dates are not available for booking." });
    }

    // Create the booking (simulate payment success by setting paymentStatus to 'Success')
    const bookingData = {
      roomId,
      guestName,
      guestEmail,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      additionalServices,
      paymentStatus: 'Success'
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Remove the booked dates from the room's availableDates
    const updatedAvailableDates = availableDates.filter(date => !bookingDates.includes(date));
    await axios.put(`${roomServiceUrl}/api/rooms/${roomId}`, { availableDates: updatedAvailableDates });

    res.status(201).json({ msg: "Booking confirmed", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};
