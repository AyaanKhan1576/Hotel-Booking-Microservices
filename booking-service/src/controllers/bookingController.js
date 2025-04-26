// controllers/bookingController.js
const axios = require('axios');
const Booking = require('../models/Booking');
const PaymentLog = require('../models/PaymentLog');
const Feedback = require('../models/Feedback');

const cron = require('node-cron');

// free up rooms after checkout
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const expired = await Booking.find({
      checkOut: { $lt: now },
      paymentStatus: 'Success'
    });
    for (let b of expired) {
      const svc = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
      await axios.put(`${svc}/api/rooms/${b.roomId}`, {
        isAvailable: true, bookedUntil: null, currentBooking: null
      });
    }
  } catch (e) {
    console.error('Cron error:', e);
  }
});

const sendNotification = async (email, subj, msg) => {
  console.log(`Notification to ${email}: ${subj}\n${msg}`);
};

const getDatesBetween = (start, end) => {
  const dates = [];
  let cur = new Date(start), last = new Date(end);
  while (cur < last) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

exports.createBooking = async (req, res) => {
  const { roomId, guestName, guestEmail, checkIn, checkOut, additionalServices, loyaltyPoints, loyaltyCoupon } = req.body;
  try {
    const svc = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const room = (await axios.get(`${svc}/api/rooms/${roomId}`)).data;
    if (!room) return res.status(404).json({ msg: 'Room not found' });

    const inD = new Date(checkIn), outD = new Date(checkOut);
    if (isNaN(inD)||isNaN(outD)) return res.status(400).json({ msg: 'Invalid date format' });

    const dates = getDatesBetween(inD, outD);
    if (!dates.every(d => room.availableDates.includes(d)))
      return res.status(400).json({ msg: 'Room not available' });

    const conflicts = await Booking.find({
      roomId,
      $or: [
        { checkIn: { $lte: outD, $gte: inD } },
        { checkOut:{ $gte: inD, $lte: outD } },
        { checkIn:{ $lte: inD }, checkOut:{ $gte: outD } }
      ]
    });
    if (conflicts.length) return res.status(400).json({ msg: 'Booking conflict detected' });

    const booking = new Booking({
      roomId, guestName, guestEmail,
      checkIn: inD, checkOut: outD,
      additionalServices,
      loyalty: { pointsUsed: loyaltyPoints||0, couponCode: loyaltyCoupon||'' }
    });
    await booking.save();

    const updated = room.availableDates.filter(d => !dates.includes(d));
    await axios.put(`${svc}/api/rooms/${roomId}`, { availableDates: updated });

    res.status(201).json({ booking });
  } catch (err) {
    console.error('Error in createBooking:', err);
    res.status(500).json({ msg:'Server error', error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ msg:'Booking not found' });

    const dates = getDatesBetween(b.checkIn, b.checkOut);
    const others = await Booking.find({
      roomId: b.roomId, paymentStatus:{ $ne:'Cancelled' }, _id:{ $ne:b._id }
    });
    const toRestore = dates.filter(d =>
      !others.some(o => new Date(o.checkIn)<=new Date(d)&&new Date(d)<new Date(o.checkOut))
    );

    const svc = process.env.ROOM_SERVICE_URL || 'http://localhost:5000';
    const room = (await axios.get(`${svc}/api/rooms/${b.roomId}`)).data;
    const newAvail = [...new Set([...(room.availableDates||[]), ...toRestore])].sort();
    await axios.put(`${svc}/api/rooms/${b.roomId}`, { availableDates: newAvail });

    b.paymentStatus = 'Cancelled';
    await b.save();

    if (b.loyalty.pointsUsed>0) {
      const us = process.env.USER_SERVICE_URL||'http://localhost:5001';
      await axios.post(`${us}/api/users/loyalty/award`, {
        email: b.guestEmail, points: b.loyalty.pointsUsed
      });
    }

    await sendNotification(b.guestEmail,'Booking Cancelled','Your booking has been cancelled');
    res.json({ msg:'Booking cancelled', booking: b });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ msg:'Email is required' });

    const raw = await Booking.find({ guestEmail: email }).lean();
    if (!raw.length) return res.status(404).json({ msg:'No bookings found' });

    const svc = process.env.ROOM_SERVICE_URL||'http://localhost:5000';
    const enriched = await Promise.all(raw.map(async b => {
      try {
        const r = (await axios.get(`${svc}/api/rooms/${b.roomId}`)).data;
        return { ...b, roomDetails: { roomNumber: r.roomNumber, type: r.type, price: r.price } };
      } catch {
        return { ...b, roomDetails:{ error:'Unable to fetch room details' } };
      }
    }));
    res.json({ bookings: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ msg:'Booking not found' });
    if (b.paymentStatus==='Cancelled')
      return res.status(400).json({ msg:'Cannot update a cancelled booking' });

    const { additionalServices, loyaltyPoints } = req.body;
    if (additionalServices) b.additionalServices = { ...b.additionalServices, ...additionalServices };
    if (loyaltyPoints!==undefined) b.loyalty.pointsUsed = loyaltyPoints;
    await b.save();
    res.json(b);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { status, details } = req.body;
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ msg:'Booking not found' });
    if (b.paymentStatus!=='Pending')
      return res.status(400).json({ msg:'Payment already processed or booking cancelled' });

    b.paymentStatus = status;
    await b.save();
    await new PaymentLog({ bookingId: b._id, transactionStatus: status, details }).save();
    await sendNotification(b.guestEmail,`Payment ${status}`,`Your payment has been processed`);
    res.json({ msg:'Payment processed', booking: b });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ msg:'Booking not found' });
    res.json(b);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};

exports.awardLoyaltyPoints = async (req, res) => {
  try {
    const { email, points } = req.body;
    if (!email||points===undefined)
      return res.status(400).json({ msg:'Email and points are required' });
    const us = process.env.USER_SERVICE_URL||'http://localhost:5001';
    await axios.post(`${us}/api/users/loyalty/award`,{ email, points });
    res.json({ msg:'Loyalty points awarded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const { email } = req.query;
    if (!bookingId||!rating||!comment||!email)
      return res.status(400).json({ msg:'Booking ID, rating, comment, and email are required' });

    const b = await Booking.findById(bookingId);
    if (!b) return res.status(404).json({ msg:'Booking not found' });
    if (b.guestEmail !== email)
      return res.status(403).json({ msg:'Unauthorized: Email does not match booking' });

    if (new Date(b.checkOut) > new Date())
      return res.status(400).json({ msg:'Feedback can only be submitted after check-out' });

    let fb = await Feedback.findOne({ bookingId });
    if (fb) {
      fb.rating = rating;
      fb.comment = comment;
      fb.createdAt = new Date();
    } else {
      fb = new Feedback({ bookingId, guestEmail: email, rating, comment });
    }
    await fb.save();
    res.status(201).json({ msg:'Feedback submitted successfully', feedback: fb });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { email } = req.query;
    const fb = await Feedback.findOne({ bookingId });
    if (!fb) return res.status(404).json({ msg:'No feedback found for this booking' });
    if (fb.guestEmail !== email)
      return res.status(403).json({ msg:'Unauthorized: Email does not match feedback' });
    res.json(fb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Server Error' });
  }
};
