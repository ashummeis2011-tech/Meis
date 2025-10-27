import api from './api.js';

export const userService = {
  // Setup profile after registration
  setupProfile: async (formData) => {
    const response = await api.post('/users/profile/setup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get own profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (formData) => {
    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Change email
  changeEmail: async (currentPassword, newEmail) => {
    const response = await api.put('/users/email', {
      current_password: currentPassword,
      new_email: newEmail
    });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/users/password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async () => {
    const response = await api.put('/users/deactivate');
    return response.data;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await api.delete('/users/account', {
      data: { password }
    });
    return response.data;
  }
};
