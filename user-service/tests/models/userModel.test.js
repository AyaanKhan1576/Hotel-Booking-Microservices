const User = require('models/User');
const bcrypt = require('bcrypt');

describe('User Model Tests', () => {

  test('should hash password before saving', async () => {
    const user = new User({
      name: 'Test',
      email: 'test@example.com',
      password: 'plainpassword'
    });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('plainpassword', salt);

    expect(hashed).not.toEqual('plainpassword');
  });

  test('should compare passwords correctly', async () => {
    const password = 'Test@123';
    const hash = await bcrypt.hash(password, 10);

    const result = await bcrypt.compare(password, hash);
    expect(result).toBe(true);
  });

});
