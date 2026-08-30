import axios from 'axios';

import { AUTH_EXPIRED_EVENT, TOKEN_STORAGE_KEY } from '../constants';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach the JWT to every request when a session exists.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on an authenticated call means the token is invalid/expired:
// clear the local session and let AuthContext react to the event.
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isPublicCall = PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));

    if (status === 401 && !isPublicCall && localStorage.getItem(TOKEN_STORAGE_KEY)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  },
);
