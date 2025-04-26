// src/index.js
require('dotenv').config();   
const cors = require('cors');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const seedUsers = require('./seeder');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
