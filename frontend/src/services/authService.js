import { api } from './api';

/**
 * Authentication API calls. All methods resolve with the response body:
 *  - register/login -> { token, user }
 *  - getMe / updateProfile -> { id, firstName, lastName, email }
 *  - changePassword -> empty (204)
 */
export const authService = {
  register(payload) {
    return api.post('/auth/register', payload).then((response) => response.data);
  },

  login(credentials) {
    return api.post('/auth/login', credentials).then((response) => response.data);
  },

  getMe() {
    return api.get('/auth/me').then((response) => response.data);
  },

  updateProfile(payload) {
    return api.post('/auth/profile', payload).then((response) => response.data);
  },

  changePassword(payload) {
    return api.post('/auth/password', payload).then((response) => response.data);
  },
};
