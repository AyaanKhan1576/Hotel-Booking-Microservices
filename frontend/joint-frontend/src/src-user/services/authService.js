import api from './api';

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Registration failed';
    throw new Error(message);
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Login failed';
    throw new Error(message);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const enrollLoyalty = async () => {
  try {
    const response = await api.post('/users/loyalty/enroll');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to enroll in loyalty program';
    throw new Error(message);
  }
};

export const getLoyaltyStatus = async () => {
  try {
    const response = await api.get('/users/loyalty/status');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch loyalty status';
    throw new Error(message);
  }
};