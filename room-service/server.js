const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const roomRoutes = require('./routes/roomRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Room Service running on port ${PORT}`));
