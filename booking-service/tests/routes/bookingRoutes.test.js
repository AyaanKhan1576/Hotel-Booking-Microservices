
const request = require('supertest');
const app = require('../../src/server');

describe('Booking Routes Tests', () => {
  it('should return 400 on missing booking email in search', async () => {
    const res = await request(app).get('/api/bookings/search');
    expect(res.statusCode).toBe(400);
  });
});
