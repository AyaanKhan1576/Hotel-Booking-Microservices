const request = require('supertest');
const express = require('express');
const userRoutes = require('routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes Integration Tests', () => {
  test('POST /api/users/register - invalid data', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: '', password: '' });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/users/login - invalid data', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: '', password: '' });

    expect(res.statusCode).toBe(400);
  });

});
