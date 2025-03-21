const Booking = require('../models/Booking');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    // Here you’d integrate with a payment gateway and update paymentStatus accordingly.
    bookingData.paymentStatus = 'Success'; // Simulate payment success for Sprint 1

    const booking = new Booking(bookingData);
    await booking.save();

    // Simulate sending a confirmation email/receipt here if desired.
    res.status(201).json({ msg: 'Booking confirmed', booking });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Optionally, get booking details by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
