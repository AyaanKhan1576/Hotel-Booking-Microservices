// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');

// Helper: generate an array of dates (YYYY-MM-DD) between two dates (inclusive of start, exclusive of end)
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

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding.");

    // Clear existing hotels and rooms if needed:
    await Hotel.deleteMany();
    await Room.deleteMany();

    // Create a dummy hotel
    const hotel = new Hotel({
      name: "Grand Plaza",
      location: "New York",
      contactInfo: "123-456-7890",
      rooms: []
    });
    await hotel.save();

    // Create dummy rooms with availableDates (for example, available throughout June 2025)
    const availableDates = generateDates("2025-06-01", "2025-07-01");

    const room1 = new Room({
      roomno: "101",
      type: "Deluxe",
      capacity: 2,
      price: 150,
      amenities: ["WiFi", "TV", "Mini Bar"],
      hotel: hotel._id,
      availableDates: availableDates
    });

    const room2 = new Room({
      roomno: "102",
      type: "Suite",
      capacity: 4,
      price: 300,
      amenities: ["WiFi", "TV", "Jacuzzi"],
      hotel: hotel._id,
      availableDates: availableDates
    });

    await room1.save();
    await room2.save();

    // Update hotel with room references
    hotel.rooms.push(room1._id, room2._id);
    await hotel.save();

    console.log("Dummy data seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedData();
