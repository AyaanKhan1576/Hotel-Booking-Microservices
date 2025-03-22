import axios from 'axios';

// Base URL for booking-service; adjust if needed
const API = axios.create({ baseURL: 'http://localhost:5002/api' });

export default API;
