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
    }).populate('roomId');

    for (const booking of expiredBookings) {
      await axios.put(`${process.env.ROOM_SERVICE_URL || 'http://localhost:5000'}/api/rooms/${booking.roomId}`, {
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
    const response = await axios.get(`http://localhost:5000/api/users/loyalty/status`, {
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
    const response = await axios.post(`http://localhost:5000/api/users/loyalty/redeem`, {
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

exports.createBooking = async (req, res) => {
  try {
    const { roomId, guestName, guestEmail, checkIn, checkOut, additionalServices, loyaltyPoints, loyaltyCoupon } = req.body;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ msg: "Check-in date must be before check-out date" });
    }

    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${roomId}`);
    const room = roomResponse.data;
    
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    // Check room availability
    if (!room.isAvailable || (room.bookedUntil && new Date(checkIn) < new Date(room.bookedUntil))) {
      return res.status(400).json({ 
        msg: "Room is not available for the selected dates",
        nextAvailable: room.bookedUntil 
      });
    }

    // Check loyalty status
    const loyaltyStatus = await checkLoyaltyStatus(guestEmail);
    let loyaltyData = { pointsUsed: 0, couponCode: '', discountApplied: 0, isPercentage: false };
    let loyaltyMessage = '';

    if (loyaltyStatus.isMember) {
      if (loyaltyPoints || loyaltyCoupon) {
        const reward = await redeemLoyaltyReward(guestEmail, loyaltyPoints, loyaltyCoupon);
        loyaltyData = {
          pointsUsed: loyaltyPoints || 0,
          couponCode: loyaltyCoupon || '',
          discountApplied: reward.discount,
          isPercentage: reward.isPercentage
        };
        loyaltyMessage = reward.message;
      }
    } else {
      loyaltyMessage = 'Not a loyalty member. Join our loyalty program to earn and redeem rewards!';
    }

    // Calculate price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const basePrice = room.price * nights;
    let finalPrice = basePrice;
    
    if (loyaltyData.discountApplied) {
      finalPrice = loyaltyData.isPercentage 
        ? basePrice * (1 - loyaltyData.discountApplied / 100)
        : basePrice - loyaltyData.discountApplied;
    }

    // Create booking
    const booking = new Booking({
      roomId,
      guestName,
      guestEmail,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      additionalServices,
      paymentStatus: 'Success',
      loyalty: loyaltyData,
      totalPrice: finalPrice
    });
    
    await booking.save();

    // Update room status
    await axios.put(`${roomServiceUrl}/api/rooms/${roomId}`, {
      isAvailable: false,
      bookedUntil: checkOutDate,
      currentBooking: booking._id
    });

    // Award loyalty points
    if (loyaltyStatus.isMember) {
      const pointsEarned = Math.floor(finalPrice / 10);
      await axios.post(`http://localhost:5000/api/users/loyalty/award`, {
        email: guestEmail,
        points: pointsEarned
      });
    }

    await sendNotification(guestEmail, "Booking Confirmed", `Your booking has been confirmed. ${loyaltyMessage}`);
    res.status(201).json({ msg: "Booking confirmed", booking, loyaltyMessage });

  } catch (err) {
    console.error('Create booking error:', err.message);
    res.status(500).json({ error: err.message || 'Server Error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    
    // Free up the room immediately
    await axios.put(`${roomServiceUrl}/api/rooms/${booking.roomId}`, {
      isAvailable: true,
      bookedUntil: null,
      currentBooking: null
    });

    booking.paymentStatus = 'Cancelled';
    await booking.save();

    // Refund loyalty points if any were used
    if (booking.loyalty.pointsUsed > 0) {
      await axios.post(`http://localhost:5000/api/users/loyalty/award`, {
        email: booking.guestEmail,
        points: booking.loyalty.pointsUsed
      });
    }

    await sendNotification(booking.guestEmail, "Booking Cancelled", "Your booking has been cancelled");
    res.json({ msg: "Booking cancelled", booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Other controller methods remain largely the same, just remove date array handling
exports.getUserBookings = async (req, res) => { /* ... */ };
exports.updateBooking = async (req, res) => { /* ... */ };
exports.processPayment = async (req, res) => { /* ... */ };
exports.getBookingById = async (req, res) => { /* ... */ };
exports.awardLoyaltyPoints = async (req, res) => { /* ... */ };