// src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');

// Validate environment variables
const requiredEnvVars = ['MONGO_URI', 'PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ FATAL: Missing environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB connected');

    // Initialize collections if they don't exist
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('hotels')) {
      await db.createCollection('hotels');
      console.log('🆕 Created hotels collection');
    }

    if (!collectionNames.includes('rooms')) {
      await db.createCollection('rooms');
      console.log('🆕 Created rooms collection');
    }

    // Add routes after successful connection
    app.use('/api/hotels', hotelRoutes);
    app.use('/api/rooms', roomRoutes);

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Database event handlers
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// Start connection process
connectWithRetry();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});