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

  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email }).then((response) => response.data);
  },

  validateResetToken(token) {
    return api.get('/auth/reset-password/validate', { params: { token } }).then((response) => response.data);
  },

  resetPassword({ token, newPassword }) {
    return api.post('/auth/reset-password', { token, newPassword }).then((response) => response.data);
  },

  verifyOtp({ code }) {
    return api.post('/auth/verify-otp', { code }).then((response) => response.data);
  },

  resendOtp() {
    return api.post('/auth/resend-otp').then((response) => response.data);
  },
};
