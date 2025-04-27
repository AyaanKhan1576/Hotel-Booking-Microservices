const mongoose = require('mongoose');
const Room = require('../../src/models/Room');

describe('Room Model Tests', () => {
  it('should create a room successfully', async () => {
    const room = new Room({
      roomno: '101',
      type: 'Standard',
      capacity: 2,
      price: 100,
      hotel: new mongoose.Types.ObjectId(),
      amenities: ['WiFi', 'AC']
    });
    expect(room.roomno).toBe('101');
    expect(room.type).toBe('Standard');
    expect(room.capacity).toBe(2);
    expect(room.price).toBe(100);
  });

  it('should fail validation with missing fields', async () => {
    const room = new Room({});
    const err = room.validateSync();
    expect(err.errors.roomno).toBeDefined();
    expect(err.errors.type).toBeDefined();
    expect(err.errors.capacity).toBeDefined();
    expect(err.errors.price).toBeDefined();
    expect(err.errors.hotel).toBeDefined();
  });
});
