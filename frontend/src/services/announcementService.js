import { api } from './api';

export const announcementService = {
  /** Public — fetch active announcements for the banner. */
  getActive() {
    return api.get('/announcements/active').then((res) => res.data);
  },

  /** Admin — list every announcement. */
  getAll() {
    return api.get('/admin/announcements').then((res) => res.data);
  },

  /** Admin — create a new announcement. */
  create(data) {
    return api.post('/admin/announcements', data).then((res) => res.data);
  },

  /** Admin — partial update (toggle active, edit fields). */
  update(id, data) {
    return api.patch(`/admin/announcements/${id}`, data).then((res) => res.data);
  },

  /** Admin — delete announcement. */
  remove(id) {
    return api.delete(`/admin/announcements/${id}`).then((res) => res.data);
  },
};
