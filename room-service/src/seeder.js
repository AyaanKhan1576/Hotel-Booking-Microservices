// room-service/seeder.js
const Room = require('./models/room');

const seedRooms = async () => {
  try {
    // Remove all existing rooms
    await Room.deleteMany();

    // Dummy room data
    const rooms = [
      {
        name: 'Deluxe Room',
        description: 'A spacious room with a beautiful view',
        images: ['https://example.com/images/deluxe1.jpg'],
        pricing: 150,
        availableDates: [new Date('2025-06-01'), new Date('2025-06-15')],
      },
      {
        name: 'Suite',
        description: 'A luxurious suite with premium amenities',
        images: ['https://example.com/images/suite1.jpg'],
        pricing: 250,
        availableDates: [new Date('2025-07-01'), new Date('2025-07-15')],
      },
    ];

    await Room.insertMany(rooms);
    console.log('Room data seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedRooms;
