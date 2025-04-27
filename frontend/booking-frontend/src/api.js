import axios from 'axios';

// Base URL for booking-service
const BookingAPI = axios.create({ baseURL: 'http://localhost:5002/api' });

// Base URL for hotel-service
const HotelAPI = axios.create({ baseURL: 'http://localhost:5000/api' });

export { BookingAPI, HotelAPI };