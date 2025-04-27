const axios = require('axios');
const Booking = require('../models/Booking');
const PaymentLog = require('../models/PaymentLog');
const cron = require('node-cron');

// Initialize cron job to free up rooms after checkout
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      checkOut: { $lt: now },
      paymentStatus: 'Success'
    });

    for (const booking of expiredBookings) {
      const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
      await axios.put(`${roomServiceUrl}/api/rooms/${booking.roomId}`, {
        isAvailable: true,
        bookedUntil: null,
        currentBooking: null
      });
    }
  } catch (err) {
    console.error('Room availability cron job error:', err);
  }
});

const sendNotification = async (guestEmail, subject, message) => {
  console.log(`Notification sent to ${guestEmail}:\nSubject: ${subject}\nMessage: ${message}`);
};

// Helper: Check loyalty status via user-service
const checkLoyaltyStatus = async (email) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${userServiceUrl}/api/users/loyalty/status`, {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking loyalty status:', error.message);
    return { isMember: false };
  }
};

// Helper: Redeem loyalty reward
const redeemLoyaltyReward = async (email, points, couponCode) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${userServiceUrl}/api/users/loyalty/redeem`, {
      email,
      points,
      couponCode
    });
    return response.data;
  } catch (error) {
    console.error('Error redeeming loyalty reward:', error.message);
    throw new Error(error.response?.data?.message || 'Failed to redeem loyalty reward');
  }
};

// Helper: Generate dates between two dates
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
  const { roomId, guestName, guestEmail, checkIn, checkOut, additionalServices, loyaltyPoints, loyaltyCoupon } = req.body;

  try {
    console.log('Booking request received:', req.body);

    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    // Fetch room from room-service
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${roomId}`);
    const room = roomResponse.data;
    if (!room) {
      console.log('Room not found for ID:', roomId);
      return res.status(404).json({ msg: 'Room not found' });
    }
    console.log('Room found:', room._id);

    // Normalize dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      console.log('Invalid date format - checkIn:', checkIn, 'checkOut:', checkOut);
      return res.status(400).json({ msg: 'Invalid date format' });
    }

    // Generate required dates
    const requiredDates = getDatesBetween(checkInDate, checkOutDate);
    console.log('Required dates:', requiredDates);

    // Check availability in room-service
    const isAvailable = requiredDates.every((date) => room.availableDates.includes(date));
    if (!isAvailable) {
      console.log('Availability check failed for dates:', requiredDates);
      return res.status(400).json({ msg: 'Room is not available for the selected dates' });
    }

    // Check for booking conflicts
    const existingBookings = await Booking.find({
      roomId: roomId,
      $or: [
        { checkIn: { $lte: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gte: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
      ],
    });
    if (existingBookings.length > 0) {
      console.log('Booking conflict detected');
      return res.status(400).json({ msg: 'Room is already booked for the selected dates' });
    }

    // Create booking
    const booking = new Booking({
      roomId,
      guestName,
      guestEmail,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      additionalServices,
      loyalty: {
        pointsUsed: loyaltyPoints || 0,
        couponCode: loyaltyCoupon || ''
      }
    });
    await booking.save();
    console.log('Booking created:', booking._id);

    // Update room availability
    const updatedAvailableDates = room.availableDates.filter((date) => !requiredDates.includes(date));
    await axios.put(`${roomServiceUrl}/api/rooms/${roomId}`, { availableDates: updatedAvailableDates });
    console.log('Room availableDates updated');

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Error in createBooking:', error.message, error.stack);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';

    // Get dates to potentially restore
    const datesToAdd = getDatesBetween(booking.checkIn, booking.checkOut);

    // Find other active bookings for the room
    const otherBookings = await Booking.find({
      roomId: booking.roomId,
      paymentStatus: { $ne: 'Cancelled' },
      _id: { $ne: booking._id }
    });

    // Determine which dates can be added back
    const unbookedDates = datesToAdd.filter(date => {
      const dateObj = new Date(date);
      return !otherBookings.some(b => new Date(b.checkIn) <= dateObj && dateObj < new Date(b.checkOut));
    });

    // Fetch current room data
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${booking.roomId}`);
    const room = roomResponse.data;

    // Update availableDates
    const currentAvailableDates = room.availableDates || [];
    const newAvailableDates = [...new Set([...currentAvailableDates, ...unbookedDates])].sort();

    await axios.put(`${roomServiceUrl}/api/rooms/${booking.roomId}`, {
      availableDates: newAvailableDates
    });

    // Update booking status
    booking.paymentStatus = 'Cancelled';
    await booking.save();

    // Refund loyalty points if used
    if (booking.loyalty.pointsUsed > 0) {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5001';
      await axios.post(`${userServiceUrl}/api/users/loyalty/award`, {
        email: booking.guestEmail,
        points: booking.loyalty.pointsUsed
      });
    }

    await sendNotification(booking.guestEmail, 'Booking Cancelled', 'Your booking has been cancelled');
    res.json({ msg: 'Booking cancelled', booking });
  } catch (err) {
    console.error('Error in cancelBooking:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    // Fetch bookings for the user
    const bookings = await Booking.find({ guestEmail: email }).lean();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found for this user' });
    }

    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';

    // Enrich bookings with room details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${booking.roomId}`);
          const room = roomResponse.data;
          return {
            ...booking,
            roomDetails: {
              roomNumber: room.roomNumber || 'N/A',
              type: room.type || 'N/A',
              price: room.price || 0
            }
          };
        } catch (error) {
          console.error(`Error fetching room details for booking ${booking._id}:`, error.message);
          return {
            ...booking,
            roomDetails: { error: 'Unable to fetch room details' }
          };
        }
      })
    );

    res.status(200).json({ bookings: enrichedBookings });
  } catch (err) {
    console.error('Error in getUserBookings:', err.message, err.stack);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalServices, loyaltyPoints } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    if (booking.paymentStatus === 'Cancelled') {
      return res.status(400).json({ msg: 'Cannot update a cancelled booking' });
    }
    if (additionalServices) {
      booking.additionalServices = { ...booking.additionalServices, ...additionalServices };
    }
    if (loyaltyPoints !== undefined) {
      booking.loyalty.pointsUsed = loyaltyPoints;
    }
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error('Error in updateBooking:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, details } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    if (booking.paymentStatus !== 'Pending') {
      return res.status(400).json({ msg: 'Payment already processed or booking cancelled' });
    }
    booking.paymentStatus = status;
    await booking.save();

    const paymentLog = new PaymentLog({
      bookingId: id,
      transactionStatus: status,
      details
    });
    await paymentLog.save();

    await sendNotification(booking.guestEmail, `Payment ${status}`, `Your payment has been processed with status: ${status}`);
    res.json({ msg: 'Payment processed', booking });
  } catch (err) {
    console.error('Error in processPayment:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error('Error in getBookingById:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.awardLoyaltyPoints = async (req, res) => {
  try {
    const { email, points } = req.body;
    if (!email || points === undefined) {
      return res.status(400).json({ msg: 'Email and points are required' });
    }
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5001';
    await axios.post(`${userServiceUrl}/api/users/loyalty/award`, { email, points });
    res.json({ msg: 'Loyalty points awarded' });
  } catch (err) {
    console.error('Error in awardLoyaltyPoints:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};