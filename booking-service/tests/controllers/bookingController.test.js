

// // tests/controllers/bookingController.test.js
// const request = require('supertest');
// const express = require('express');
// const mongoose = require('mongoose');
// const axios = require('axios');
// const cron = require('node-cron');

// jest.mock('axios');
// jest.mock('node-cron');

// const Booking = require('../../src/models/Booking');
// const PaymentLog = require('../../src/models/PaymentLog');

// jest.mock('../../src/models/Booking');
// jest.mock('../../src/models/PaymentLog');

// const bookingRoutes = require('../../src/routes/bookingRoutes');

// const app = express();
// app.use(express.json());
// app.use('/api/bookings', bookingRoutes);

// describe('bookingController + bookingRoutes', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   const parseId = () => new mongoose.Types.ObjectId();

//   describe('Utility getDatesBetween()', () => {
//     const { getDatesBetween } = require('../../src/controllers/bookingController');
//     it('should generate intermediate dates', () => {
//       expect(getDatesBetween('2025-06-01', '2025-06-04'))
//         .toEqual(['2025-06-01','2025-06-02','2025-06-03']);
//     });
//     it('should return empty if start>=end', () => {
//       expect(getDatesBetween('2025-06-05','2025-06-05')).toEqual([]);
//       expect(getDatesBetween('2025-06-06','2025-06-05')).toEqual([]);
//     });
//   });

//   describe('POST /api/bookings   createBooking()', () => {
//     const url = '/api/bookings';
//     const fakeRoom = { _id: parseId(), availableDates:['2025-06-01'] };

//     it('404 when room not found', async () => {
//       axios.get.mockResolvedValue({ data:null });
//       const res = await request(app).post(url).send({
//         roomId:fakeRoom._id, guestName:'x', guestEmail:'x@x', checkIn:'2025-06-01', checkOut:'2025-06-02'
//       });
//       expect(res.status).toBe(404);
//       expect(res.body.msg).toBe('Room not found');
//     });

//     it('400 on invalid date', async () => {
//       axios.get.mockResolvedValue({ data:fakeRoom });
//       const res = await request(app).post(url).send({
//         roomId:fakeRoom._id, guestName:'x', guestEmail:'x@x', checkIn:'bad', checkOut:'bad'
//       });
//       expect(res.status).toBe(400);
//       expect(res.body.msg).toBe('Invalid date format');
//     });

//     it('400 on unavailable dates', async () => {
//       axios.get.mockResolvedValue({ data:fakeRoom });
//       const res = await request(app).post(url).send({
//         roomId:fakeRoom._id, guestName:'x', guestEmail:'x@x',
//         checkIn:'2025-06-01', checkOut:'2025-06-03'
//       });
//       expect(res.status).toBe(400);
//       expect(res.body.msg).toBe('Room is not available for the selected dates');
//     });

//     it('400 on booking conflict', async () => {
//       axios.get.mockResolvedValue({ data:fakeRoom });
//       Booking.find.mockResolvedValue([{}]);
//       const res = await request(app).post(url).send({
//         roomId:fakeRoom._id, guestName:'x', guestEmail:'x@x',
//         checkIn:'2025-06-01', checkOut:'2025-06-02'
//       });
//       expect(res.status).toBe(400);
//       expect(res.body.msg).toBe('Room is already booked for the selected dates');
//     });

//     it('201 on success', async () => {
//       axios.get.mockResolvedValue({ data:fakeRoom });
//       Booking.find.mockResolvedValue([]);
//       Booking.prototype.save = jest.fn().mockResolvedValue();
//       axios.put.mockResolvedValue({});
//       const res = await request(app).post(url).send({
//         roomId:fakeRoom._id, guestName:'x', guestEmail:'x@x',
//         checkIn:'2025-06-01', checkOut:'2025-06-02'
//       });
//       expect(res.status).toBe(201);
//       expect(res.body.booking).toBeDefined();
//     });

//     it('500 on unexpected error', async () => {
//       axios.get.mockRejectedValue(new Error('boom'));
//       const res = await request(app).post(url).send({
//         roomId:fakeRoom._id, guestName:'x', guestEmail:'x@x',
//         checkIn:'2025-06-01', checkOut:'2025-06-02'
//       });
//       expect(res.status).toBe(500);
//       expect(res.body.msg).toBe('Server error');
//     });
//   });

//   describe('GET /api/bookings/:id   getBookingById()', () => {
//     it('404 when missing', async () => {
//       Booking.findById.mockResolvedValue(null);
//       const res = await request(app).get(`/api/bookings/${parseId()}`);
//       expect(res.status).toBe(404);
//       expect(res.body.msg).toBe('Booking not found');
//     });
//     it('200 returns booking', async () => {
//       const fake = { foo:'bar' };
//       Booking.findById.mockResolvedValue(fake);
//       const res = await request(app).get(`/api/bookings/${parseId()}`);
//       expect(res.status).toBe(200);
//       expect(res.body).toEqual(fake);
//     });
//   });

//   describe('PUT /api/bookings/:id   updateBooking()', () => {
//     it('404 when missing', async () => {
//       Booking.findById.mockResolvedValue(null);
//       const res = await request(app).put(`/api/bookings/${parseId()}`).send({});
//       expect(res.status).toBe(404);
//       expect(res.body.msg).toBe('Booking not found');
//     });
//     it('400 when cancelled', async () => {
//       Booking.findById.mockResolvedValue({ paymentStatus:'Cancelled' });
//       const res = await request(app).put(`/api/bookings/${parseId()}`).send({});
//       expect(res.status).toBe(400);
//       expect(res.body.msg).toBe('Cannot update a cancelled booking');
//     });
//     it('200 on success', async () => {
//       const booking = { paymentStatus:'Pending', save:jest.fn()};
//       Booking.findById.mockResolvedValue(booking);
//       const res = await request(app).put(`/api/bookings/${parseId()}`)
//         .send({ additionalServices:{ breakfast:true }});
//       expect(res.status).toBe(200);
//       expect(booking.save).toHaveBeenCalled();
//       expect(res.body).toEqual(booking);
//     });
//   });

//   describe('DELETE /api/bookings/:id   cancelBooking()', () => {
//     it('404 when missing', async () => {
//       Booking.findById.mockResolvedValue(null);
//       const res = await request(app).delete(`/api/bookings/${parseId()}`);
//       expect(res.status).toBe(404);
//       expect(res.body.msg).toBe('Booking not found');
//     });
//     it('200 on cancel + refund', async () => {
//       const booking = {
//         _id:parseId(), roomId:parseId(),
//         checkIn:new Date('2025-06-01'), checkOut:new Date('2025-06-02'),
//         paymentStatus:'Pending', loyalty:{ pointsUsed:5 },
//         save:jest.fn()
//       };
//       Booking.findById.mockResolvedValue(booking);
//       axios.get.mockResolvedValue({ data:{ availableDates:[] }});
//       axios.put.mockResolvedValue({});
//       axios.post.mockResolvedValue({});
//       const res = await request(app).delete(`/api/bookings/${booking._id}`);
//       expect(res.status).toBe(200);
//       expect(booking.save).toHaveBeenCalled();
//     });
//   });

//   describe('GET /api/bookings/search   getUserBookings()', () => {
//     it('400 when no email', async () => {
//       const res = await request(app).get('/api/bookings/search');
//       expect(res.status).toBe(400);
//       expect(res.body.msg).toBe('Email is required');
//     });
//     it('404 when none', async () => {
//       Booking.find.mockResolvedValue([]);
//       const res = await request(app).get('/api/bookings/search')
//         .query({ email:'a@a.com' });
//       expect(res.status).toBe(404);
//     });
//     it('200 on success', async () => {
//       const b = [{ _id:1, guestEmail:'a@a', roomId:parseId(), checkIn:new Date(), checkOut:new Date()}];
//       Booking.find.mockResolvedValue(b);
//       axios.get.mockResolvedValue({ data:{ roomNumber:'101', type:'Deluxe', price:200 }});
//       const res = await request(app).get('/api/bookings/search')
//         .query({ email:'a@a.com' });
//       expect(res.status).toBe(200);
//       expect(res.body.bookings[0].roomDetails).toBeDefined();
//     });
//   });

//   describe('PATCH /api/bookings/:id/payment   processPayment()', () => {
//     it('404 when missing', async () => {
//       Booking.findById.mockResolvedValue(null);
//       const res = await request(app).patch(`/api/bookings/${parseId()}/payment`).send({});
//       expect(res.status).toBe(404);
//     });
//     it('400 when already done', async () => {
//       Booking.findById.mockResolvedValue({ paymentStatus:'Success' });
//       const res = await request(app).patch(`/api/bookings/${parseId()}/payment`)
//         .send({ status:'Success', details:'ok' });
//       expect(res.status).toBe(400);
//     });
//     it('200 on success', async () => {
//       const bk = { _id:1, paymentStatus:'Pending', save:jest.fn()};
//       Booking.findById.mockResolvedValue(bk);
//       PaymentLog.prototype.save = jest.fn().mockResolvedValue();
//       axios.post.mockResolvedValue();
//       const res = await request(app).patch(`/api/bookings/${bk._id}/payment`)
//         .send({ status:'Success', details:'ok' });
//       expect(res.status).toBe(200);
//       expect(bk.save).toHaveBeenCalled();
//     });
//   });

//   describe('POST /api/bookings/loyalty/award   awardLoyaltyPoints()', () => {
//     it('400 when missing', async () => {
//       const res = await request(app).post('/api/bookings/loyalty/award').send({});
//       expect(res.status).toBe(400);
//       expect(res.body.msg).toBe('Email and points are required');
//     });
//     it('200 on success', async () => {
//       axios.post.mockResolvedValue();
//       const res = await request(app).post('/api/bookings/loyalty/award')
//         .send({ email:'a@a', points:10 });
//       expect(res.status).toBe(200);
//       expect(res.body.msg).toBe('Loyalty points awarded');
//     });
//   });
// });


// tests/controllers/bookingController.branches2.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Booking = require('../../src/models/Booking');
const PaymentLog = require('../../src/models/PaymentLog');

jest.mock('axios');
jest.mock('../../src/models/Booking');
jest.mock('../../src/models/PaymentLog');

const bookingRoutes = require('../../src/routes/bookingRoutes');
const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

describe('bookingController – full branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const roomId = new mongoose.Types.ObjectId();

  describe('POST /api/bookings (createBooking)', () => {
    it('404 if room not found', async () => {
      axios.get.mockResolvedValue({ data: null });
      const res = await request(app).post('/api/bookings').send({ roomId });
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Room not found');
    });

    it('400 on invalid date format', async () => {
      axios.get.mockResolvedValue({ data: { availableDates: [] } });
      const res = await request(app).post('/api/bookings').send({
        roomId,
        checkIn: 'not-a-date',
        checkOut: 'also-not'
      });
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Invalid date format');
    });

    it('400 if room unavailable', async () => {
      axios.get.mockResolvedValue({ data: { availableDates: ['2025-01-01'] } });
      const res = await request(app).post('/api/bookings').send({
        roomId,
        checkIn: '2025-01-02',
        checkOut: '2025-01-03'
      });
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Room is not available for the selected dates');
    });

    it('400 on booking conflict', async () => {
      axios.get.mockResolvedValue({ data: { availableDates: ['2025-01-01','2025-01-02'] } });
      Booking.find.mockResolvedValue([{}]);
      const res = await request(app).post('/api/bookings').send({
        roomId,
        checkIn: '2025-01-01',
        checkOut: '2025-01-02'
      });
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Room is already booked for the selected dates');
    });

    it('201 happy path', async () => {
      axios.get.mockResolvedValue({ data: { availableDates: ['2025-06-01','2025-06-02'] } });
      Booking.find.mockResolvedValue([]);
      Booking.prototype.save = jest.fn().mockResolvedValue();
      axios.put.mockResolvedValue({});
      const res = await request(app).post('/api/bookings').send({
        roomId,
        guestName: 'Alice',
        guestEmail: 'a@a.com',
        checkIn: '2025-06-01',
        checkOut: '2025-06-02'
      });
      expect(res.status).toBe(201);
      expect(res.body.booking).toBeDefined();
      expect(Booking.prototype.save).toHaveBeenCalled();
    });

    it('500 on downstream axios.put error', async () => {
      axios.get.mockResolvedValue({ data: { availableDates: ['2025-06-01','2025-06-02'] } });
      Booking.find.mockResolvedValue([]);
      Booking.prototype.save = jest.fn().mockResolvedValue();
      axios.put.mockRejectedValue(new Error('upderr'));
      const res = await request(app).post('/api/bookings').send({
        roomId,
        guestName: 'Bob',
        guestEmail: 'b@b.com',
        checkIn: '2025-06-01',
        checkOut: '2025-06-02'
      });
      expect(res.status).toBe(500);
      expect(res.body.msg).toBe('Server error');
    });
  });

  describe('DELETE /api/bookings/:id (cancelBooking)', () => {
    const bId = new mongoose.Types.ObjectId();
    it('404 if booking not found', async () => {
      Booking.findById.mockResolvedValue(null);
      const res = await request(app).delete(`/api/bookings/${bId}`);
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Booking not found');
    });

    it('200 happy cancellation with loyalty refund', async () => {
      const fake = {
        _id: bId,
        roomId,
        checkIn: new Date('2025-06-01'),
        checkOut: new Date('2025-06-02'),
        paymentStatus: 'Success',
        loyalty: { pointsUsed: 10 },
        save: jest.fn()
      };
      Booking.findById.mockResolvedValue(fake);
      Booking.find = jest.fn().mockResolvedValue([]); // otherBookings
      axios.get.mockResolvedValue({ data: { availableDates: ['2025-06-01'] } });
      axios.put.mockResolvedValue({});
      axios.post.mockResolvedValue({}); // refund points
      console.log = jest.fn();

      const res = await request(app).delete(`/api/bookings/${bId}`);
      expect(res.status).toBe(200);
      expect(res.body.booking.paymentStatus).toBe('Cancelled');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/loyalty/award'),
        { email: expect.any(String), points: 10 }
      );
    });

    it('500 on axios.get failure', async () => {
      const fake = { _id: bId, roomId, checkIn:new Date, checkOut:new Date, paymentStatus:'Success', loyalty:{pointsUsed:0}};
      Booking.findById.mockResolvedValue(fake);
      Booking.find = jest.fn().mockResolvedValue([]);
      axios.get.mockRejectedValue(new Error('down'));
      const res = await request(app).delete(`/api/bookings/${bId}`);
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Server Error');
    });
  });

  describe('GET /api/bookings/search (getUserBookings)', () => {
    it('400 on missing email', async () => {
      const res = await request(app).get('/api/bookings/search');
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Email is required');
    });

    it('404 on no bookings', async () => {
      Booking.find.mockResolvedValue([]);
      const res = await request(app).get('/api/bookings/search').query({ email:'x@x' });
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('No bookings found for this user');
    });

    it('200 with enriched bookings (error fetching room)', async () => {
      const record = { _id:1, roomId, guestEmail:'u@u', checkIn:new Date, checkOut:new Date };
      Booking.find.mockResolvedValue([record]);
      axios.get.mockRejectedValue(new Error('roomdown'));
      const res = await request(app).get('/api/bookings/search').query({ email:'u@u' });
      expect(res.status).toBe(200);
      expect(res.body.bookings[0].roomDetails.error).toMatch(/Unable to fetch/);
    });
  });

  describe('PUT /api/bookings/:id (updateBooking)', () => {
    const bId = new mongoose.Types.ObjectId();
    it('404 if not found', async () => {
      Booking.findById.mockResolvedValue(null);
      const res = await request(app).put(`/api/bookings/${bId}`);
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Booking not found');
    });
    it('400 if cancelled', async () => {
      Booking.findById.mockResolvedValue({ paymentStatus:'Cancelled' });
      const res = await request(app).put(`/api/bookings/${bId}`);
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Cannot update a cancelled booking');
    });
    it('200 happy update', async () => {
      const obj = { paymentStatus:'Pending', save: jest.fn() };
      Booking.findById.mockResolvedValue(obj);
      const res = await request(app).put(`/api/bookings/${bId}`)
        .send({ additionalServices:{breakfast:true}, loyaltyPoints:5 });
      expect(res.status).toBe(200);
      expect(obj.save).toHaveBeenCalled();
      expect(res.body.loyalty.pointsUsed).toBe(5);
    });
  });

  describe('PATCH /api/bookings/:id/payment (processPayment)', () => {
    const bId = new mongoose.Types.ObjectId();
    it('404 if not found', async () => {
      Booking.findById.mockResolvedValue(null);
      const res = await request(app).patch(`/api/bookings/${bId}/payment`);
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Booking not found');
    });
    it('400 if already processed', async () => {
      Booking.findById.mockResolvedValue({ paymentStatus:'Success' });
      const res = await request(app).patch(`/api/bookings/${bId}/payment`);
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Payment already processed or booking cancelled');
    });
    it('200 happy payment', async () => {
      const bk = { _id:bId, paymentStatus:'Pending', save: jest.fn() };
      Booking.findById.mockResolvedValue(bk);
      PaymentLog.prototype.save = jest.fn().mockResolvedValue();
      console.log = jest.fn();
      const res = await request(app)
        .patch(`/api/bookings/${bId}/payment`)
        .send({ status:'Failed', details:'err' });
      expect(res.status).toBe(200);
      expect(bk.save).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookings/:id (getBookingById)', () => {
    const bId = new mongoose.Types.ObjectId();
    it('404 if not found', async () => {
      Booking.findById.mockResolvedValue(null);
      const res = await request(app).get(`/api/bookings/${bId}`);
      expect(res.status).toBe(404);
    });
    it('200 if found', async () => {
      const obj = { _id:bId };
      Booking.findById.mockResolvedValue(obj);
      const res = await request(app).get(`/api/bookings/${bId}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(String(bId));
    });
  });

  describe('POST /api/bookings/loyalty/award (awardLoyaltyPoints)', () => {
    it('400 if missing', async () => {
      const res = await request(app).post('/api/bookings/loyalty/award').send({});
      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('Email and points are required');
    });
    it('200 on success', async () => {
      axios.post.mockResolvedValue({});
      const res = await request(app).post('/api/bookings/loyalty/award')
        .send({ email:'u@u', points:10 });
      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Loyalty points awarded');
    });
  });
});
