import api from './api.js';

export const swipeService = {
  // Get next user to swipe on
  getNextUser: async () => {
    const response = await api.get('/swipe/next');
    return response.data;
  },

  // Record a swipe
  swipe: async (swipedUserId, direction) => {
    const response = await api.post('/swipe', {
      swiped_user_id: swipedUserId,
      direction
    });
    return response.data;
  },

  // Get stats (total users)
  getStats: async () => {
    const response = await api.get('/swipe/stats');
    return response.data;
  }
};
