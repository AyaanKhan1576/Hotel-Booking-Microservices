
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const roomRoutes = require('./routes/roomRoutes');
const seedRooms = require('./seeder');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');

  const db = mongoose.connection.db;
  const collections = await db.listCollections({ name: 'rooms' }).toArray();
  if (collections.length === 0) {
    await db.createCollection('rooms');
    console.log('Rooms collection created');
  } else {
    console.log('Rooms collection already exists');
  }

  if (process.env.SEED === 'true') {
    await seedRooms();
  }
})
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
