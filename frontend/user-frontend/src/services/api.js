import axios from 'axios';

const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  return instance;
};

const userApi = createApiInstance(process.env.REACT_APP_USER_API_URL || 'http://localhost:5000/api');
const bookingApi = createApiInstance(process.env.REACT_APP_BOOKING_API_URL || 'http://localhost:5002/api');

export { userApi, bookingApi };