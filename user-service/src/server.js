// src/server.js
const cors = require('cors');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const seedUsers = require('./seeder');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.config({ path: envPath });
if (envConfig.error) {
  console.error('FATAL: Failed to load .env file');
  process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`FATAL: Missing environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

// Database connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');

    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('users');
      console.log('Created users collection');
    }

    if (process.env.SEED === 'true') {
      await seedUsers();
      console.log('Database seeded successfully');
    }
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Database event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Start server
const startServer = async () => {
  await connectWithRetry();
  
  app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });

  // Mount routes
  app.use('/api/users', userRoutes);
  app.use('/api/users', favouriteRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Launch
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});