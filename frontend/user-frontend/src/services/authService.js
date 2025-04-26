// src/services/authService.js
import api from './api';

/**
 * Register a new user.
 * @param {{ name: string; email: string; password: string; role: string }} userData
 * @returns {{ message: string; userId: number }}
 * @throws {Error} with server-provided message or fallback.
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    // prefer server message, else fallback
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Registration failed';
    throw new Error(message);
  }
};

/**
 * Log in an existing user.
 * @param {{ email: string; password: string }} credentials
 * @returns {{ token: string; userId: number; role: string }}
 * @throws {Error} with server-provided message or fallback.
 */
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

/**
 * Log out the current user by clearing local storage.
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
