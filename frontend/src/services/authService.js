import api from './api.js';

export const authService = {
  // Register new user
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
  }
};
