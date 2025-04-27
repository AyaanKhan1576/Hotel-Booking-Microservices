const mongoose = require('mongoose');
const Hotel = require('../../src/models/Hotel');

describe('Hotel Model Tests', () => {
  it('should create a hotel successfully', async () => {
    const hotel = new Hotel({
      name: 'Test Hotel',
      location: 'Test City',
      contactInfo: '123456789'
    });
    expect(hotel.name).toBe('Test Hotel');
    expect(hotel.location).toBe('Test City');
    expect(hotel.contactInfo).toBe('123456789');
  });

  it('should fail without required fields', async () => {
    const hotel = new Hotel({});
    const err = hotel.validateSync();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.location).toBeDefined();
    expect(err.errors.contactInfo).toBeDefined();
  });
});
