const mongoose = require('mongoose');
const PriceChangeLog = require('../../src/models/PriceChangeLog');

describe('PriceChangeLog Model Tests', () => {
  it('should create a price change log successfully', async () => {
    const log = new PriceChangeLog({
      room: new mongoose.Types.ObjectId(),
      oldPrice: 100,
      newPrice: 120,
      changedBy: 'admin@test.com'
    });
    expect(log.oldPrice).toBe(100);
    expect(log.newPrice).toBe(120);
    expect(log.changedBy).toBe('admin@test.com');
  });

  it('should fail validation with missing fields', async () => {
    const log = new PriceChangeLog({});
    const err = log.validateSync();
    expect(err.errors.room).toBeDefined();
    expect(err.errors.oldPrice).toBeDefined();
    expect(err.errors.newPrice).toBeDefined();
  });
});
