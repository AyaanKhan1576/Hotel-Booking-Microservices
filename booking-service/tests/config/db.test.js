// const connectDB = require('../../src/config/db');
// const mongoose = require('mongoose');

// jest.mock('mongoose', () => ({
//   connect: jest.fn(),
// }));

// describe('DB Connection', () => {
//   it('should connect to the database', async () => {
//     mongoose.connect.mockResolvedValueOnce();
//     await connectDB();
//     expect(mongoose.connect).toHaveBeenCalled();
//   });

//   it('should handle connection error', async () => {
//     mongoose.connect.mockRejectedValueOnce(new Error('Failed'));
//     const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
//     await connectDB();
//     expect(exitSpy).toHaveBeenCalled();
//     exitSpy.mockRestore();
//   });
// });

// tests/config/db.test.js
const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');

jest.mock('mongoose');

describe('config/db.js', () => {
  it('logs success on connect', async () => {
    mongoose.connect.mockResolvedValueOnce();
    console.log = jest.fn();
    await connectDB();
    expect(console.log).toHaveBeenCalledWith('Booking Service MongoDB connected');
  });

  it('logs error and exits on failure', async () => {
    const error = new Error('fail');
    mongoose.connect.mockRejectedValueOnce(error);
    console.error = jest.fn();
    // suppress process.exit from killing tests
    const spyExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('EXIT'); });
    await expect(connectDB()).rejects.toThrow('EXIT');
    expect(console.error).toHaveBeenCalledWith('fail');
    spyExit.mockRestore();
  });
});
