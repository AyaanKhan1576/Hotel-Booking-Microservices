const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Hotel = require('../../src/models/Hotel');
const Room = require('../../src/models/Room');
const roomRoutes = require('../../src/routes/roomRoutes');

const app = express();
app.use(express.json());
app.use('/api/rooms', roomRoutes);

let hotelId;
let roomId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hotel = await Hotel.create({ name: 'Hotel for Rooms', location: 'Test City', contactInfo: '999' });
  hotelId = hotel._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Room Routes', () => {
  it('should create a room', async () => {
    const res = await request(app).post('/api/rooms').send({
      roomno: '101',
      type: 'Standard',
      capacity: 2,
      price: 100,
      hotel: hotelId,
      amenities: ['WiFi', 'AC']
    });
    expect(res.statusCode).toBe(201);
    roomId = res.body._id;
  });

  it('should get all rooms', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a room by id', async () => {
    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.roomno).toBe('101');
  });

  it('should update a room', async () => {
    const res = await request(app).put(`/api/rooms/${roomId}`).send({
      price: 150
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(150);
  });

  it('should patch room price successfully', async () => {
    const res = await request(app).patch(`/api/rooms/${roomId}/price`).send({
      newPrice: 180
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.room.price).toBe(180);
  });

  it('should filter rooms by capacity', async () => {
    const res = await request(app).get('/api/rooms?capacity=2');
    expect(res.statusCode).toBe(200);
  });

  it('should fail to patch invalid price', async () => {
    const res = await request(app).patch(`/api/rooms/${roomId}/price`).send({
      newPrice: -10
    });
    expect(res.statusCode).toBe(400);
  });

  it('should delete a room', async () => {
    const res = await request(app).delete(`/api/rooms/${roomId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Room removed/);
  });

  it('should return 404 for non-existing room', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/rooms/${fakeId}`);
    expect([404, 500]).toContain(res.statusCode);
  });
});
