const axios = require('axios');
const Booking = require('../models/Booking');
const PaymentLog = require('../models/PaymentLog');

// Helper: Generate an array of date strings (YYYY-MM-DD)
// from check-in (inclusive) to check-out (exclusive)
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

// Simulated notification function
const sendNotification = async (guestEmail, subject, message) => {
  // In a real application, you might integrate with Nodemailer or Twilio here.
  console.log(`Notification sent to ${guestEmail}:\nSubject: ${subject}\nMessage: ${message}`);
  // For example, using nodemailer:
  // const nodemailer = require('nodemailer');
  // ... setup transporter and send mail
};

// Existing createBooking function remains as before...
exports.createBooking = async (req, res) => {
  try {
    const { roomId, guestName, guestEmail, checkIn, checkOut, additionalServices } = req.body;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ msg: "Check-in date must be before check-out date." });
    }

    // Generate the array of dates to be booked
    const bookingDates = getDatesBetween(checkIn, checkOut);

    // Get room details from the hotel-service
    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${roomId}`);
    const room = roomResponse.data;
    if (!room) {
      return res.status(404).json({ msg: "Room not found." });
    }

    // Check if every booking date is available
    const availableDates = room.availableDates || [];
    const allDatesAvailable = bookingDates.every(date => availableDates.includes(date));
    if (!allDatesAvailable) {
      return res.status(400).json({ msg: "Some or all of the requested dates are not available for booking." });
    }

    // Create the booking (simulate payment by setting paymentStatus to 'Success')
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

    // Send notification for booking confirmation
    await sendNotification(guestEmail, "Booking Confirmed", "Your booking has been confirmed successfully.");

    res.status(201).json({ msg: "Booking confirmed", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// New function: Get all bookings for a guest (booking history/upcoming)
exports.getUserBookings = async (req, res) => {
  try {
    const { guestEmail } = req.query;
    if (!guestEmail) {
      return res.status(400).json({ msg: "guestEmail query parameter is required." });
    }
    const bookings = await Booking.find({ guestEmail });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// New function: Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    // Optionally, add logic to handle date changes:
    // e.g., re-check availability, update room's availableDates accordingly
    const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true });
    if (!booking) return res.status(404).json({ msg: "Booking not found." });
    
    // Send notification about the update
    await sendNotification(booking.guestEmail, "Booking Updated", "Your booking has been updated successfully.");
    res.json({ msg: "Booking updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// New function: Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found." });

    // Get the room details for potential re-adding of available dates (if desired)
    const roomServiceUrl = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const roomResponse = await axios.get(`${roomServiceUrl}/api/rooms/${booking.roomId}`);
    const room = roomResponse.data;

    // Generate the booked dates from the booking (same as when it was created)
    const bookingDates = getDatesBetween(booking.checkIn, booking.checkOut);

    // Option: Update room availability by adding the cancelled dates back.
    const updatedAvailableDates = [...room.availableDates, ...bookingDates];
    // Optionally, sort dates if needed:
    updatedAvailableDates.sort();

    await axios.put(`${roomServiceUrl}/api/rooms/${booking.roomId}`, { availableDates: updatedAvailableDates });

    // Mark the booking as cancelled (you could also delete it)
    booking.paymentStatus = 'Cancelled';
    await booking.save();

    // Send cancellation notification
    await sendNotification(booking.guestEmail, "Booking Cancelled", "Your booking has been cancelled.");

    res.json({ msg: "Booking cancelled", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};



// New function: Process Payment (Dummy Payment Simulation with Logging)
exports.processPayment = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Find the booking by its ID
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found." });
    
    // Simulate payment processing by updating paymentStatus to "Success"
    booking.paymentStatus = "Success";
    await booking.save();
    
    // Log the payment transaction in PaymentLog
    const paymentLog = await PaymentLog.create({
      bookingId: booking._id,
      transactionStatus: "Success",
      details: "Dummy payment processed successfully."
    });
    
    // Send a notification to the guest confirming payment (simulation)
    await sendNotification(
      booking.guestEmail,
      "Payment Processed",
      "Your payment has been successfully processed."
    );
    
    res.json({ msg: "Payment processed successfully", booking, paymentLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};



// Existing function: Get booking by ID
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
