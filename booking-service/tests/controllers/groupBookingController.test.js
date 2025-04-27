// const groupBookingController = require('../../src/controllers/groupBookingController');
// const GroupBooking = require('../../src/models/GroupBooking');
// const axios = require('axios');

// jest.mock('../../src/models/GroupBooking');
// jest.mock('axios');

// describe('Group Booking Controller Tests', () => {
//   let req, res;

//   beforeEach(() => {
//     req = { body: {}, params: {}, query: {} };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('createGroupBooking', () => {
//     it('should return 400 if agentEmail missing', async () => {
//       req.body = { rooms: [] };
//       await groupBookingController.createGroupBooking(req, res);
//       expect(res.status).toHaveBeenCalledWith(400);
//     });
//   });

//   describe('getAgentGroupBookings', () => {
//     it('should fetch group bookings', async () => {
//       GroupBooking.find.mockResolvedValue([{ agentEmail: 'agent@example.com' }]);
//       req.query = { agentEmail: 'agent@example.com' };
//       await groupBookingController.getAgentGroupBookings(req, res);
//       expect(res.status).toHaveBeenCalledWith(200);
//     });
//   });

//   describe('updateDiscount', () => {
//     it('should return 404 if group not found', async () => {
//       GroupBooking.findById.mockResolvedValue(null);
//       req.params.groupId = '123';
//       await groupBookingController.updateDiscount(req, res);
//       expect(res.status).toHaveBeenCalledWith(404);
//     });
//   });
// });



// tests/controllers/groupBookingController.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

jest.mock('axios');

const GroupBooking = require('../../src/models/GroupBooking');
const Booking = require('../../src/models/Booking');

jest.mock('../../src/models/GroupBooking');
jest.mock('../../src/models/Booking');

const groupBookingRoutes = require('../../src/routes/groupBookingRoutes');

const app = express();
app.use(express.json());
app.use('/api/group-bookings', groupBookingRoutes);

describe('groupBookingController + routes', () => {
  beforeEach(() => jest.clearAllMocks());

  const parseId = () => new mongoose.Types.ObjectId();

  describe('utils', () => {
    const ctrl = require('../../src/controllers/groupBookingController');
    it('getDatesBetween()', () => {
      expect(ctrl.getDatesBetween('2025-06-01','2025-06-03'))
        .toEqual(['2025-06-01','2025-06-02']);
    });
    it('calculateTotal()', async () => {
      axios.get.mockResolvedValue({ data:{ price:50 }});
      const rooms = [{ roomId:parseId(), checkIn:'2025-06-01', checkOut:'2025-06-02' }];
      const total = await ctrl.calculateTotal(rooms, 10);
      expect(total).toBe(45);
    });
  });

  describe('POST /api/group-bookings   createGroupBooking()', () => {
    const url = '/api/group-bookings';
    it('400 on bad payload', async () => {
      const res = await request(app).post(url).send({});
      expect(res.status).toBe(400);
    });
    it('500 when axios fails', async () => {
      axios.get.mockRejectedValue(new Error('xxx'));
      const payload = { agentEmail:'a@a', rooms:[{ roomId:parseId(), guestName:'g', guestEmail:'g@', checkIn:'2025-06-01', checkOut:'2025-06-02' }], discountRate:0 };
      const res = await request(app).post(url).send(payload);
      expect(res.status).toBe(500);
    });
    it('201 on success', async () => {
      const roomId = parseId();
      axios.get.mockResolvedValue({ data:{ availableDates:['2025-06-01'], price:100, type:'Std', roomNumber:'101' }});
      Booking.prototype.save = jest.fn().mockResolvedValue();
      axios.put = jest.fn().mockResolvedValue();
      const fakeGroup = { _id:1, agentEmail:'a@a', rooms:[], discountRate:0, totalPrice:90 };
      GroupBooking.create = jest.fn().mockResolvedValue(fakeGroup);

      const payload = { agentEmail:'a@a', rooms:[{ roomId, guestName:'g', guestEmail:'g@', checkIn:'2025-06-01', checkOut:'2025-06-02' }], discountRate:10 };
      const res = await request(app).post(url).send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(fakeGroup);
    });
  });

  describe('GET /api/group-bookings   getAgentGroupBookings()', () => {
    it('200 returns array', async () => {
      GroupBooking.find.mockResolvedValue([{}]);
      const res = await request(app).get('/api/group-bookings').query({ agentEmail:'a@a' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/group-bookings/:groupId/rooms/:roomId   updateRoomAssignment()', () => {
    it('404 when group missing', async () => {
      GroupBooking.findById.mockResolvedValue(null);
      const res = await request(app)
        .put(`/api/group-bookings/${parseId()}/rooms/${parseId()}`)
        .send({ status:'Cancelled' });
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Group booking not found');
    });
  });

  describe('PATCH /api/group-bookings/:groupId/discount   updateDiscount()', () => {
    it('404 when missing', async () => {
      GroupBooking.findById.mockResolvedValue(null);
      const res = await request(app)
        .patch(`/api/group-bookings/${parseId()}/discount`)
        .send({ discountRate:20 });
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Group booking not found');
    });
  });
});
