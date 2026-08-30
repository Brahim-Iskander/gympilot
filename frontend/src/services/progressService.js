import { api } from './api';

export const progressService = {
  /**
   * Fetch all progress entries for the authenticated user, ordered reverse-chronologically.
   */
  async getAll() {
    const response = await api.get('/progress');
    return response.data;
  },

  /**
   * Fetch a single progress entry by ID.
   */
  async getById(id) {
    const response = await api.get(`/progress/${id}`);
    return response.data;
  },

  /**
   * Create a new progress entry.
   * payload: { date, weight, weightUnit, measurements, measurementUnit, strengthLogs, photos, note }
   */
  async create(entryData) {
    const response = await api.post('/progress', entryData);
    return response.data;
  },

  /**
   * Update an existing progress entry.
   */
  async update(id, entryData) {
    const response = await api.put(`/progress/${id}`, entryData);
    return response.data;
  },

  /**
   * Delete a progress entry by ID.
   */
  async delete(id) {
    await api.delete(`/progress/${id}`);
    return true;
  },

  /**
   * Trigger AI personalized progress & trend analysis.
   */
  async analyze() {
    const response = await api.post('/progress/analyze');
    return response.data;
  },
};
