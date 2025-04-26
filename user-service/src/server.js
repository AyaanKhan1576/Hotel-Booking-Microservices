// src/server.js
const cors = require('cors');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const seedUsers = require('./seeder');

// 1. Load environment variables
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.error('❌ FATAL: Failed to load .env file');
  process.exit(1);
}

// 2. Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ FATAL: Missing environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// 3. Initialize Express app
const app = express();
app.use(express.json());
// server.js
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add explicit OPTIONS handler
app.options('*', cors());

// 4. Database connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected');

    // Initialize collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection('users');
      console.log('🆕 Created users collection');
    }

    // Seed data if enabled
    if (process.env.SEED === 'true') {
      await seedUsers();
      console.log('🌱 Database seeded successfully');
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// 5. Database event handlers
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// 6. Start server
const startServer = async () => {
  await connectWithRetry();
  
  // Configure routes
  app.use('/api/users', userRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

// Start the application
startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});