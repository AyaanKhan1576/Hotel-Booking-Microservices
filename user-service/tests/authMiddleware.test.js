const auth = require('middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('models/User');

jest.mock('../src/models/User');

describe('Auth Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      cookies: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should authenticate valid token', async () => {
    req.header.mockReturnValue('Bearer validtoken');
    jwt.verify = jest.fn().mockReturnValue({ id: 'userId' });
    User.findOne.mockResolvedValue({});

    await auth(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should reject invalid token', async () => {
    req.header.mockReturnValue('Bearer invalidtoken');
    jwt.verify = jest.fn(() => { throw new Error('Invalid token'); });

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

});
