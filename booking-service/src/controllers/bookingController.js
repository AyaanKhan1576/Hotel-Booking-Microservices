const axios = require('axios');
const Booking = require('../models/Booking');
const PaymentLog = require('../models/PaymentLog');

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

    const bookingDates = getDatesBetween(checkIn, checkOut);
    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${roomId}`);
    const room = roomResponse.data;
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    const availableDates = room.availableDates || [];
    const allDatesAvailable = bookingDates.every(date => availableDates.includes(date));
    if (!allDatesAvailable) {
      return res.status(400).json({ msg: "Some or all of the requested dates are not available" });
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

    // Calculate base price (before discount)
    const nights = bookingDates.length;
    const basePrice = room.price * nights;

    // Apply discount
    let finalPrice = basePrice;
    if (loyaltyData.discountApplied) {
      if (loyaltyData.isPercentage) {
        finalPrice = basePrice * (1 - loyaltyData.discountApplied / 100);
      } else {
        finalPrice = basePrice - loyaltyData.discountApplied;
      }
    }

    // Create booking
    const bookingData = {
      roomId,
      guestName,
      guestEmail,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      additionalServices,
      paymentStatus: 'Success',
      loyalty: loyaltyData
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Update room availability
    const updatedAvailableDates = availableDates.filter(date => !bookingDates.includes(date));
    await axios.put(`${roomServiceUrl}/api/rooms/${roomId}`, { availableDates: updatedAvailableDates });

    // Award loyalty points (e.g., 10 points per $100 spent)
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

// New function: Award loyalty points
exports.awardLoyaltyPoints = async (req, res) => {
  try {
    const { email, points } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.loyalty.isMember) {
      return res.status(400).json({ message: 'User is not a loyalty member' });
    }

    user.loyalty.points += points;
    // Upgrade tier based on points (e.g., Silver at 500, Gold at 1000)
    if (user.loyalty.points >= 1000) user.loyalty.tier = 'Gold';
    else if (user.loyalty.points >= 500) user.loyalty.tier = 'Silver';
    
    await user.save();
    await AuditLog.create({
      adminId: null,
      action: 'loyalty_points_award',
      targetUserId: user.userId,
      oldData: { loyalty: { points: user.loyalty.points - points, tier: user.loyalty.tier } },
      newData: { loyalty: user.loyalty }
    });

    res.json({ message: `Awarded ${points} points`, loyalty: user.loyalty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Existing functions (unchanged)
exports.getUserBookings = async (req, res) => {
  try {
    const { guestEmail } = req.query;
    if (!guestEmail) {
      return res.status(400).json({ msg: "guestEmail query parameter is required" });
    }
    const bookings = await Booking.find({ guestEmail });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true });
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    
    await sendNotification(booking.guestEmail, "Booking Updated", "Your booking has been updated successfully");
    res.json({ msg: "Booking updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${booking.roomId}`);
    const room = roomResponse.data;

    const bookingDates = getDatesBetween(booking.checkIn, booking.checkOut);
    const updatedAvailableDates = [...room.availableDates, ...bookingDates].sort();

    await axios.put(`${roomServiceUrl}/api/rooms/${booking.roomId}`, { availableDates: updatedAvailableDates });

    booking.paymentStatus = 'Cancelled';
    await booking.save();

    await sendNotification(booking.guestEmail, "Booking Cancelled", "Your booking has been cancelled");
    res.json({ msg: "Booking cancelled", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    
    booking.paymentStatus = "Success";
    await booking.save();
    
    const paymentLog = await PaymentLog.create({
      bookingId: booking._id,
      transactionStatus: "Success",
      details: "Dummy payment processed successfully"
    });
    
    await sendNotification(
      booking.guestEmail,
      "Payment Processed",
      "Your payment has been successfully processed"
    );
    
    res.json({ msg: "Payment processed successfully", booking, paymentLog });
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