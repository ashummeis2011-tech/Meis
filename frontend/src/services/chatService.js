import api from './api.js';

export const chatService = {
  // Get all matches
  getMatches: async () => {
    const response = await api.get('/matches');
    return response.data;
  },

  // Get specific match details
  getMatch: async (matchId) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  // Get messages for a match
  getMessages: async (matchId, limit = 50, offset = 0) => {
    const response = await api.get(`/messages/${matchId}`, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Send text/emoji message
  sendMessage: async (matchId, messageType, content) => {
    const response = await api.post('/messages', {
      match_id: matchId,
      message_type: messageType,
      content
    });
    return response.data;
  },

  // Send image message
  sendImageMessage: async (matchId, imageFile) => {
    const formData = new FormData();
    formData.append('match_id', matchId);
    formData.append('image', imageFile);

    const response = await api.post('/messages/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export const interestService = {
  // Get all interest tags
  getInterests: async () => {
    const response = await api.get('/interests');
    return response.data;
  }
};
