// src/seeder.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Counter = require('./models/Counter');
const bcrypt = require('bcrypt');

const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('✅ Users already seeded');
      return;
    }
    
    const testUsers = [
      { 
        name: 'Test User', 
        email: 'user@test.com', 
        password: 'test123', 
        role: 'user' 
      },
      { 
        name: 'Hotel Manager', 
        email: 'manager@test.com', 
        password: 'test123', 
        role: 'hotelManagement' 
      },
      { 
        name: 'Travel Agent', 
        email: 'agent@test.com', 
        password: 'test123', 
        role: 'travelAgent' 
      },
      { 
        name: 'Admin User', 
        email: 'admin@test.com', 
        password: 'test123', 
        role: 'admin' 
      }
    ];
    
    // Create users and log their IDs
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`🌱 Seeded user: ${user.email} | ID: ${user.userId} | Role: ${user.role}`);
    }
    
    console.log('✅ Database seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
  }
};

module.exports = seedUsers;