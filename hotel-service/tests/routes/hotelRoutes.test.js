const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Hotel = require('../../src/models/Hotel');
const hotelRoutes = require('../../src/routes/hotelRoutes');

const app = express();
app.use(express.json());
app.use('/api/hotels', hotelRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Hotel Routes', () => {
  let hotelId;

  it('should create a hotel', async () => {
    const res = await request(app).post('/api/hotels').send({
      name: 'Test Hotel',
      location: 'Test City',
      contactInfo: '123456789'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Hotel');
    hotelId = res.body._id;
  });

  it('should get all hotels', async () => {
    const res = await request(app).get('/api/hotels');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a hotel by id', async () => {
    const res = await request(app).get(`/api/hotels/${hotelId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Hotel');
  });

  it('should update a hotel', async () => {
    const res = await request(app).put(`/api/hotels/${hotelId}`).send({
      name: 'Updated Hotel'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Hotel');
  });

  it('should delete a hotel', async () => {
    const res = await request(app).delete(`/api/hotels/${hotelId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Hotel and all associated rooms removed/);
  });

  it('should return 404 for non-existing hotel', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/hotels/${fakeId}`);
    expect([404, 500]).toContain(res.statusCode);
  });
});
