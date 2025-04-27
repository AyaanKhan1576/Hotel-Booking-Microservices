
const request = require('supertest');
const app = require('../../src/server');

describe('Group Booking Routes Tests', () => {
  it('should respond with 400 for invalid group booking data', async () => {
    const res = await request(app).post('/api/group-bookings').send({});
    expect(res.statusCode).toBe(400);
  });
});
