// src/seeder.js
const User = require('./models/User');

const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('Users already seeded');
      return;
    }
    
    const users = [
      { name: 'John Doe', email: 'user@example.com', password: 'password123', role: 'user' },
      { name: 'Hotel Manager', email: 'hotel@example.com', password: 'password123', role: 'hotelManagement' },
      { name: 'Travel Agent', email: 'agent@example.com', password: 'password123', role: 'travelAgent' },
      { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' }
    ];
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Seeded user: ${user.email} with userId: ${user.userId}`);
    }
    
    console.log('User data seeded successfully');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

module.exports = seedUsers;
