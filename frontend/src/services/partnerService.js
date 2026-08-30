import { api } from './api';

export const partnerService = {
  // Public - fetch list of partners for home page
  getPublicPartners() {
    return api.get('/partners').then((res) => res.data);
  },

  // Admin - fetch partners
  getAdminPartners() {
    return api.get('/admin/partners').then((res) => res.data);
  },

  // Admin - create new partner
  createPartner(payload) {
    return api.post('/admin/partners', payload).then((res) => res.data);
  },

  // Admin - delete partner
  deletePartner(id) {
    return api.delete(`/admin/partners/${id}`).then((res) => res.data);
  },
};
