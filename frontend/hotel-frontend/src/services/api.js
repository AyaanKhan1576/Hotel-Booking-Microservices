import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const get_avail_hotels = (params = {}) => {return API.get('/hotels', { params });};
export const get_hotel = (id) => API.get(`/hotels/${id}`);
export const create_new_hotel = (hotel) => API.post('/hotels', hotel);
export const update_hotel_info = (id, hotel) => API.put(`/hotels/${id}`, hotel);
export const del_hotel = (id) => API.delete(`/hotels/${id}`);

export const get_avail_rooms = (params = {}) => {return API.get('/rooms', { params });};
export const get_room = (id) => API.get(`/rooms/${id}`);
export const cretae_new_room = (room) => API.post('/rooms', room);
export const update_room_info = (id, room) => API.put(`/rooms/${id}`, room);
export const del_room = (id) => API.delete(`/rooms/${id}`);