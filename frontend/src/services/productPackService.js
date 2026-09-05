import { api } from './api';

export const productPackService = {
  // Public
  getActivePacks: async () => {
    const res = await api.get('/packs');
    return res.data;
  },

  getFeaturedPacks: async () => {
    const res = await api.get('/packs/featured');
    return res.data;
  },

  getPack: async (idOrSlug) => {
    const res = await api.get(`/packs/${idOrSlug}`);
    return res.data;
  },

  // Admin
  getAllPacksForAdmin: async () => {
    const res = await api.get('/admin/packs');
    return res.data;
  },

  createPack: async (payload) => {
    const res = await api.post('/admin/packs', payload);
    return res.data;
  },

  updatePack: async (id, payload) => {
    const res = await api.put(`/admin/packs/${id}`, payload);
    return res.data;
  },

  deletePack: async (id) => {
    await api.delete(`/admin/packs/${id}`);
  },

  toggleActive: async (id) => {
    const res = await api.patch(`/admin/packs/${id}/toggle-active`);
    return res.data;
  },

  toggleFeatured: async (id) => {
    const res = await api.patch(`/admin/packs/${id}/toggle-featured`);
    return res.data;
  },

  // Seller Methods
  getSellerPacks: async () => {
    const res = await api.get('/seller/packs');
    return res.data;
  },

  createSellerPack: async (payload) => {
    const res = await api.post('/seller/packs', payload);
    return res.data;
  },

  updateSellerPack: async (id, payload) => {
    const res = await api.put(`/seller/packs/${id}`, payload);
    return res.data;
  },

  deleteSellerPack: async (id) => {
    await api.delete(`/seller/packs/${id}`);
  },

  toggleActiveSellerPack: async (id) => {
    const res = await api.patch(`/seller/packs/${id}/toggle-active`);
    return res.data;
  },
};
