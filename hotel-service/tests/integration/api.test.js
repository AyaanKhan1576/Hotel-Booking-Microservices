// const request = require('supertest');
// const express = require('express');
// const hotelRoutes = require('../../src/routes/hotelRoutes');
// const roomRoutes = require('../../src/routes/roomRoutes');

// const app = express();
// app.use(express.json());
// app.use('/api/hotels', hotelRoutes);
// app.use('/api/rooms', roomRoutes);

// describe('API Integration Tests', () => {
//     jest.setTimeout(10000);  // 20 seconds timeout
  
//     it('GET /api/hotels should return array', async () => {
//       const res = await request(app).get('/api/hotels');
//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body)).toBe(true);
//     });
  
//     it('GET /api/rooms should return array', async () => {
//       const res = await request(app).get('/api/rooms');
//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body)).toBe(true);
//     });
//   });


const request = require('supertest');
const mongoose = require('mongoose');

// We won't import app directly since it does not export
const BASE_URL = 'http://localhost:3001'; // Your actual server URL during tests

describe('API Integration Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('GET /api/hotels should return array', async () => {
    const res = await request(BASE_URL).get('/api/hotels');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/rooms should return array', async () => {
    const res = await request(BASE_URL).get('/api/rooms');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ...your other tests for hotels/:id, rooms/:id etc
});
