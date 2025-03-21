// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const seedUsers = require('./seeder');

dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');

  // Optionally create the 'users' collection if it doesn't exist
  const db = mongoose.connection.db;
  const collections = await db.listCollections({ name: 'users' }).toArray();
  if (collections.length === 0) {
    await db.createCollection('users');
    console.log('Users collection created');
  } else {
    console.log('Users collection already exists');
  }

  // Run the seeder if enabled
  if (process.env.SEED === 'true') {
    await seedUsers();
  }
})
.catch((err) => console.error('MongoDB connection error:', err));

// Use User routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
