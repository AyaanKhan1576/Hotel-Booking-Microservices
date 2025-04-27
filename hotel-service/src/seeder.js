// seed.js
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});
console.log('→ in seed.js, MONGO_URI =', JSON.stringify(process.env.MONGO_URI));
const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');

// Helper: Generate an array of dates (YYYY-MM-DD) between two dates (inclusive of start, exclusive of end)
const generateDates = (start, end) => {
  const dates = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current < last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Helper: Generate random hotel name
const getRandomHotelName = () => {
  const prefixes = ['Grand', 'Royal', 'Sunset', 'Ocean', 'Star', 'City', 'Elite', 'Paradise'];
  const suffixes = ['Plaza', 'Inn', 'Resort', 'Hotel', 'Lodge', 'Suites'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
    suffixes[Math.floor(Math.random() * suffixes.length)]
  }`;
};

// Helper: Generate random location
const getRandomLocation = () => {
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Boston'];
  return locations[Math.floor(Math.random() * locations.length)];
};

// Helper: Generate random contact info
const getRandomContact = () => {
  return `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Helper: Generate random room number
const getRandomRoomNo = () => {
  return `${Math.floor(1 + Math.random() * 9)}${Math.floor(100 + Math.random() * 900)}`; // e.g., 2101, 4302
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    // Clear existing hotels and rooms
    await Hotel.deleteMany();
    await Room.deleteMany();
    console.log('Cleared existing Hotels and Rooms.');

    // Define hotels
    const hotels = [
      {
        name: 'Grand Plaza',
        location: 'New York',
        contactInfo: '123-456-7890',
        rooms: [],
      },
      {
        name: 'Tipton Hotel',
        location: 'New York',
        contactInfo: '321-654-0987',
        rooms: [],
      },
      {
        name: 'Sunset Resort',
        location: 'Miami',
        contactInfo: '555-123-4567',
        rooms: [],
      },
      {
        name: getRandomHotelName(),
        location: getRandomLocation(),
        contactInfo: getRandomContact(),
        rooms: [],
      },
      {
        name: getRandomHotelName(),
        location: getRandomLocation(),
        contactInfo: getRandomContact(),
        rooms: [],
      },
    ];

    const savedHotels = [];
    for (const hotelData of hotels) {
      const hotel = new Hotel(hotelData);
      await hotel.save();
      savedHotels.push(hotel);
      console.log(`🌱 Seeded hotel: ${hotel.name} | ID: ${hotel._id}`);
    }

    // Generate available dates for rooms (June 2025)
    const availableDates = generateDates('2025-06-01', '2025-07-01');

    const roomTypes = ['Standard', 'Deluxe', 'Suite'];
    const amenitiesOptions = [
      ['WiFi', 'TV', 'Mini Bar'],
      ['WiFi', 'TV', 'Jacuzzi'],
      ['WiFi', 'Air Conditioning'],
      ['WiFi', 'TV', 'Coffee Maker'],
    ];

    const rooms = [];
    for (const hotel of savedHotels) {
      const roomCount = Math.floor(Math.random() * 4) + 2; // 2-5 rooms per hotel
      for (let i = 0; i < roomCount; i++) {
        const room = new Room({
          roomno: getRandomRoomNo(),
          type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
          capacity: Math.floor(Math.random() * 4) + 1, // 1-4
          price: Math.floor(Math.random() * 200) + 100, // 100-300
          amenities: amenitiesOptions[Math.floor(Math.random() * amenitiesOptions.length)],
          hotel: hotel._id,
          availableDates,
        });
        await room.save();
        hotel.rooms.push(room._id);
        rooms.push(room);
        console.log(`🌱 Seeded room: ${room.roomno} | Type: ${room.type} | Hotel: ${hotel.name}`);
      }
      await hotel.save();
    }

    console.log('✅ Database seeded successfully with hotels and rooms');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();