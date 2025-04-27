// src/seeder.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Counter = require('./models/Counter');
const bcrypt = require('bcrypt');

// Helper function to generate random names
const getRandomName = () => {
  const firstNames = ['John', 'Jane', 'Alex', 'Emma', 'Chris', 'Sarah', 'Mike', 'Laura', 'David', 'Sophie'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson', 'Davis', 'Clark', 'Harris'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`;
};

// Helper function to generate random email
const getRandomEmail = (name) => {
  const domains = ['example.com', 'test.com', 'mail.com', 'travel.com'];
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}${Math.floor(Math.random() * 100)}@${
    domains[Math.floor(Math.random() * domains.length)]
  }`;
};

// Helper function to generate random coupon code
const generateCouponCode = () => {
  return 'CPN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Helper function to generate random date within the next 30-90 days
const getRandomExpiryDate = () => {
  const days = Math.floor(Math.random() * (90 - 30 + 1)) + 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Helper function to generate random loyalty data
const getRandomLoyalty = () => {
  const isMember = Math.random() > 0.5; // 50% chance of being a loyalty member
  if (!isMember) {
    return {
      isMember: false,
      points: 0,
      coupons: [],
      tier: 'Bronze',
    };
  }

  const points = Math.floor(Math.random() * 500); // 0-500 points
  const tier = points > 300 ? 'Gold' : points > 150 ? 'Silver' : 'Bronze';
  const coupons = [];
  const couponCount = Math.floor(Math.random() * 3); // 0-2 coupons

  for (let i = 0; i < couponCount; i++) {
    coupons.push({
      code: generateCouponCode(),
      discountPercentage: Math.floor(Math.random() * 20) + 5, // 5-25% discount
      expiryDate: getRandomExpiryDate(),
      used: Math.random() > 0.7, // 30% chance coupon is used
    });
  }

  return {
    isMember: true,
    points,
    coupons,
    tier,
  };
};

// Helper function to generate random favorites
const getRandomFavorites = () => {
  const favoriteCount = Math.floor(Math.random() * 3); // 0-2 favorites
  const favorites = [];
  for (let i = 0; i < favoriteCount; i++) {
    favorites.push({
      itemId: Math.floor(Math.random() * 1000) + 1, // Random item ID
      type: Math.random() > 0.5 ? 'hotel' : 'room',
    });
  }
  return favorites;
};

const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('✅ Users already seeded');
      return;
    }

    const testUsers = [
      {
        name: 'John Smith',
        email: 'john.smith@test.com',
        password: 'password123',
        role: 'user',
        favorites: [
          { itemId: 101, type: 'hotel' },
          { itemId: 202, type: 'room' },
        ],
        loyalty: {
          isMember: true,
          points: 200,
          coupons: [
            {
              code: 'CPN-WELCOME1',
              discountPercentage: 10,
              expiryDate: new Date('2025-06-01'),
              used: false,
            },
          ],
          tier: 'Silver',
        },
      },
      {
        name: 'Emma Johnson',
        email: 'emma.johnson@test.com',
        password: 'securepass456',
        role: 'user',
        favorites: [],
        loyalty: {
          isMember: false,
          points: 0,
          coupons: [],
          tier: 'Bronze',
        },
      },
      {
        name: 'Hotel Manager',
        email: 'manager@test.com',
        password: 'manager789',
        role: 'hotelManagement',
        favorites: [{ itemId: 303, type: 'hotel' }],
        loyalty: {
          isMember: false,
          points: 0,
          coupons: [],
          tier: 'Bronze',
        },
      },
      {
        name: 'Travel Agent',
        email: 'agent@test.com',
        password: 'agent101',
        role: 'travelAgent',
        favorites: [],
        loyalty: {
          isMember: true,
          points: 50,
          coupons: [],
          tier: 'Bronze',
        },
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        favorites: [],
        loyalty: {
          isMember: false,
          points: 0,
          coupons: [],
          tier: 'Bronze',
        },
      },
    ];

    // Generate 5 additional random users
    for (let i = 0; i < 5; i++) {
      const name = getRandomName();
      testUsers.push({
        name,
        email: getRandomEmail(name),
        password: 'testpass' + Math.floor(Math.random() * 1000),
        role: ['user', 'user', 'user', 'hotelManagement', 'travelAgent'][Math.floor(Math.random() * 5)], // Weighted towards 'user'
        favorites: getRandomFavorites(),
        loyalty: getRandomLoyalty(),
      });
    }

    // Create users and log their IDs
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(
        `🌱 Seeded user: ${user.email} | ID: ${user.userId} | Role: ${user.role} | Loyalty: ${user.loyalty.isMember ? 'Member' : 'Non-Member'}`
      );
    }

    console.log('✅ Database seeded successfully with 10 users');
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
  }
};

module.exports = seedUsers;