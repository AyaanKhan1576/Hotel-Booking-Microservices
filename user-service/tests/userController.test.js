
// const userController = require('controllers/userController');
// const User = require('models/User');
// const AuditLog = require('models/AuditLog');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');

// jest.mock('models/User');
// jest.mock('models/AuditLog');

// const mockResponse = () => {
//   const res = {};
//   res.status = jest.fn().mockReturnValue(res);
//   res.json = jest.fn().mockReturnValue(res);
//   return res;
// };

// describe('User Controller Expanded Tests', () => {

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   // REGISTER
//   describe('register', () => {
//     test('should register a new user successfully', async () => {
//       const req = { body: { name: 'Test', email: 'test@example.com', password: 'pass' } };
//       const res = mockResponse();

//       User.findOne.mockResolvedValue(null);
//       User.prototype.save = jest.fn().mockResolvedValue({});

//       await userController.register(req, res);

//       expect(res.status).toHaveBeenCalledWith(201);
//     });

//     test('should return 400 if user already exists', async () => {
//       const req = { body: { email: 'exists@example.com' } };
//       const res = mockResponse();

//       User.findOne.mockResolvedValue(true);

//       await userController.register(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//     });
//   });

//   // LOGIN
//   describe('login', () => {
//     test('should login with correct credentials', async () => {
//       const req = { body: { email: 'test@example.com', password: 'password' } };
//       const res = mockResponse();
//       const user = { comparePassword: jest.fn().mockResolvedValue(true), _id: '123', email: 'test@example.com', role: 'user', userId: 1 };

//       User.findOne.mockResolvedValue(user);
//       jwt.sign = jest.fn().mockReturnValue('mockToken');

//       await userController.login(req, res);

//       expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'mockToken' }));
//     });

//     test('should fail login if password mismatch', async () => {
//       const req = { body: { email: 'test@example.com', password: 'wrong' } };
//       const res = mockResponse();

//       const user = { comparePassword: jest.fn().mockResolvedValue(false) };
//       User.findOne.mockResolvedValue(user);

//       await userController.login(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//     });

//     test('should fail login if user not found', async () => {
//       const req = { body: { email: 'test@example.com', password: 'pass' } };
//       const res = mockResponse();

//       User.findOne.mockResolvedValue(null);

//       await userController.login(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//     });
//   });

//   // ENROLL LOYALTY
//   describe('enrollLoyalty', () => {
//     test('should enroll user successfully', async () => {
//       const req = { user: { _id: '123' } };
//       const res = mockResponse();
//       const user = { loyalty: { isMember: false, coupons: [] }, save: jest.fn().mockResolvedValue(), userId: 1 };

//       User.findById.mockResolvedValue(user);

//       await userController.enrollLoyalty(req, res);

//       expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
//     });

//     test('should fail if user not found', async () => {
//       const req = { user: { _id: '123' } };
//       const res = mockResponse();

//       User.findById.mockResolvedValue(null);

//       await userController.enrollLoyalty(req, res);

//       expect(res.status).toHaveBeenCalledWith(404);
//     });

//     test('should fail if already a loyalty member', async () => {
//       const req = { user: { _id: '123' } };
//       const res = mockResponse();
//       const user = { loyalty: { isMember: true } };

//       User.findById.mockResolvedValue(user);

//       await userController.enrollLoyalty(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//     });
//   });

//   // GET LOYALTY STATUS
//   describe('getLoyaltyStatus', () => {
//     test('should return loyalty status', async () => {
//       const req = { user: { _id: '123' } };
//       const res = mockResponse();
//       const user = { loyalty: { isMember: true, points: 100, coupons: [], tier: 'Silver' } };

//       User.findById.mockResolvedValue(user);

//       await userController.getLoyaltyStatus(req, res);

//       expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ isMember: true }));
//     });

//     test('should fail if user not found', async () => {
//       const req = { user: { _id: '123' } };
//       const res = mockResponse();

//       User.findById.mockResolvedValue(null);

//       await userController.getLoyaltyStatus(req, res);

//       expect(res.status).toHaveBeenCalledWith(404);
//     });
//   });

//   // REDEEM LOYALTY REWARD
//   describe('redeemLoyaltyReward', () => {
//     test('should redeem points', async () => {
//       const req = { body: { email: 'test@example.com', points: 10 } };
//       const res = mockResponse();
//       const user = { loyalty: { isMember: true, points: 20, coupons: [], save: jest.fn().mockResolvedValue() }, userId: 1 };

//       User.findOne.mockResolvedValue(user);

//       await userController.redeemLoyaltyReward(req, res);

//       expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
//     });

//     test('should fail if no points/coupon provided', async () => {
//       const req = { body: { email: 'test@example.com' } };
//       const res = mockResponse();

//       await userController.redeemLoyaltyReward(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//     });

//     test('should fail if user not found', async () => {
//       const req = { body: { email: 'notfound@example.com', points: 10 } };
//       const res = mockResponse();

//       User.findOne.mockResolvedValue(null);

//       await userController.redeemLoyaltyReward(req, res);

//       expect(res.status).toHaveBeenCalledWith(404);
//     });
//   });

//   // FAVORITES
//   describe('Favorites', () => {
//     test('addFavorite success', async () => {
//       const req = { user: { _id: '123' }, body: { itemId: 1, type: 'hotel' } };
//       const res = mockResponse();
//       const user = { favorites: [], save: jest.fn().mockResolvedValue() };

//       User.findById.mockResolvedValue(user);

//       await userController.addFavorite(req, res);

//       expect(res.json).toHaveBeenCalled();
//     });

//     test('removeFavorite success', async () => {
//       const req = { user: { _id: '123' }, body: { itemId: 1, type: 'hotel' } };
//       const res = mockResponse();
//       const user = {
//         favorites: [{ itemId: 1, type: 'hotel' }],
//         save: jest.fn().mockResolvedValue()
//       };

//       User.findById.mockResolvedValue(user);

//       await userController.removeFavorite(req, res);

//       expect(res.json).toHaveBeenCalled();
//     });

//     test('getFavorites success', async () => {
//       const req = { user: { _id: '123' } };
//       const res = mockResponse();
//       const user = { favorites: [{ itemId: 1, type: 'hotel' }] };

//       User.findById.mockResolvedValue(user);

//       await userController.getFavorites(req, res);

//       expect(res.json).toHaveBeenCalledWith(user.favorites);
//     });
//   });

// });



const userController = require('../src/controllers/userController');
const User = require('models/User');
const AuditLog = require('models/AuditLog');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('models/User');
jest.mock('models/AuditLog');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Final User Controller Full Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // REGISTER
  describe('register', () => {
    test('should register user', async () => {
      const req = { body: { name: 'Test', email: 'test@example.com', password: 'pass' } };
      const res = mockResponse();
      User.findOne.mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue({});

      await userController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should not register if user exists', async () => {
      const req = { body: { email: 'exists@example.com' } };
      const res = mockResponse();
      User.findOne.mockResolvedValue(true);

      await userController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // LOGIN
  describe('login', () => {
    test('should login successfully', async () => {
      const req = { body: { email: 'test@example.com', password: 'pass' } };
      const res = mockResponse();
      const user = { comparePassword: jest.fn().mockResolvedValue(true), _id: '123', email: 'test@example.com', role: 'user', userId: 1 };
      User.findOne.mockResolvedValue(user);
      jwt.sign = jest.fn().mockReturnValue('token');

      await userController.login(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token' }));
    });

    test('should fail login if wrong password', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrong' } };
      const res = mockResponse();
      const user = { comparePassword: jest.fn().mockResolvedValue(false) };
      User.findOne.mockResolvedValue(user);

      await userController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail login if user not found', async () => {
      const req = { body: { email: 'missing@example.com', password: 'pass' } };
      const res = mockResponse();
      User.findOne.mockResolvedValue(null);

      await userController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // LOYALTY
  describe('loyalty', () => {
    test('should enroll loyalty', async () => {
      const req = { user: { _id: '123' } };
      const res = mockResponse();
      const user = { loyalty: { isMember: false, coupons: [] }, save: jest.fn().mockResolvedValue(), userId: 1 };
      User.findById.mockResolvedValue(user);

      await userController.enrollLoyalty(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should fail enroll loyalty if already member', async () => {
      const req = { user: { _id: '123' } };
      const res = mockResponse();
      const user = { loyalty: { isMember: true } };
      User.findById.mockResolvedValue(user);

      await userController.enrollLoyalty(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should get loyalty status', async () => {
      const req = { user: { _id: '123' } };
      const res = mockResponse();
      const user = { loyalty: { isMember: true, points: 100, coupons: [], tier: 'Gold' } };
      User.findById.mockResolvedValue(user);

      await userController.getLoyaltyStatus(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should fail loyalty status if user not found', async () => {
      const req = { user: { _id: '123' } };
      const res = mockResponse();
      User.findById.mockResolvedValue(null);

      await userController.getLoyaltyStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should redeem points', async () => {
      const req = { body: { email: 'test@example.com', points: 10 } };
      const res = mockResponse();
      const user = { loyalty: { isMember: true, points: 20, coupons: [], save: jest.fn().mockResolvedValue() }, userId: 1 };
      User.findOne.mockResolvedValue(user);

      await userController.redeemLoyaltyReward(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should redeem coupon code', async () => {
      const req = { body: { email: 'test@example.com', couponCode: 'COUPON1' } };
      const res = mockResponse();
      const user = { loyalty: { isMember: true, points: 50, coupons: [{ code: 'COUPON1', used: false, expiryDate: new Date(Date.now() + 10000) }], save: jest.fn().mockResolvedValue() }, userId: 1 };
      User.findOne.mockResolvedValue(user);

      await userController.redeemLoyaltyReward(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should fail redeem with insufficient points', async () => {
      const req = { body: { email: 'test@example.com', points: 100 } };
      const res = mockResponse();
      const user = { loyalty: { isMember: true, points: 10, coupons: [], save: jest.fn().mockResolvedValue() }, userId: 1 };
      User.findOne.mockResolvedValue(user);

      await userController.redeemLoyaltyReward(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail redeem with invalid coupon', async () => {
      const req = { body: { email: 'test@example.com', couponCode: 'INVALID' } };
      const res = mockResponse();
      const user = { loyalty: { isMember: true, points: 20, coupons: [], save: jest.fn().mockResolvedValue() }, userId: 1 };
      User.findOne.mockResolvedValue(user);

      await userController.redeemLoyaltyReward(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail redeem with no input', async () => {
      const req = { body: { email: 'test@example.com' } };
      const res = mockResponse();

      await userController.redeemLoyaltyReward(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // USERS CRUD
  describe('User CRUD', () => {
    test('should get all users', async () => {
      const req = {};
      const res = mockResponse();
      User.find.mockResolvedValue([{ name: 'Test' }]);

      await userController.getAllUsers(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should update user', async () => {
      const req = { params: { id: '123' }, body: { name: 'Updated' }, user: { _id: 'admin123' } };
      const res = mockResponse();
      User.findOne.mockResolvedValue({ _id: '123' });
      User.findOneAndUpdate.mockResolvedValue({ _id: '123', name: 'Updated' });

      await userController.updateUser(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should fail update if user not found', async () => {
      const req = { params: { id: '123' }, body: {} };
      const res = mockResponse();
      User.findOne.mockResolvedValue(null);

      await userController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should delete user', async () => {
      const req = { params: { id: '123' }, user: { _id: 'admin123' } };
      const res = mockResponse();
      User.findOne.mockResolvedValue({ _id: '123', toObject: jest.fn() });

      await userController.deleteUser(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should fail delete if user not found', async () => {
      const req = { params: { id: '123' } };
      const res = mockResponse();
      User.findOne.mockResolvedValue(null);

      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // FAVORITES
  describe('Favorites', () => {
    test('should add favorite', async () => {
      const req = { user: { _id: '123' }, body: { itemId: 1, type: 'hotel' } };
      const res = mockResponse();
      const user = { favorites: [], save: jest.fn().mockResolvedValue() };
      User.findById.mockResolvedValue(user);

      await userController.addFavorite(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should fail add favorite if invalid type', async () => {
      const req = { user: { _id: '123' }, body: { itemId: 1, type: 'invalid' } };
      const res = mockResponse();

      await userController.addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail add favorite if already exists', async () => {
      const req = { user: { _id: '123' }, body: { itemId: 1, type: 'hotel' } };
      const res = mockResponse();
      const user = { favorites: [{ itemId: 1, type: 'hotel' }] };
      User.findById.mockResolvedValue(user);

      await userController.addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should remove favorite', async () => {
      const req = { user: { _id: '123' }, body: { itemId: 1, type: 'hotel' } };
      const res = mockResponse();
      const user = { favorites: [{ itemId: 1, type: 'hotel' }], save: jest.fn().mockResolvedValue() };
      User.findById.mockResolvedValue(user);

      await userController.removeFavorite(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should fail remove favorite if not found', async () => {
      const req = { user: { _id: '123' }, body: { itemId: 1, type: 'hotel' } };
      const res = mockResponse();
      const user = { favorites: [], save: jest.fn().mockResolvedValue() };
      User.findById.mockResolvedValue(user);

      await userController.removeFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should get favorites', async () => {
      const req = { user: { _id: '123' } };
      const res = mockResponse();
      const user = { favorites: [{ itemId: 1, type: 'hotel' }] };
      User.findById.mockResolvedValue(user);

      await userController.getFavorites(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
