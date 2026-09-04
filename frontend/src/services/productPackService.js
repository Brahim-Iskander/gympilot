import { api } from './api';

export const productPackService = {
  // Public
  getActivePacks: async () => {
    const res = await api.get('/api/packs');
    return res.data;
  },

  getFeaturedPacks: async () => {
    const res = await api.get('/api/packs/featured');
    return res.data;
  },

  getPack: async (idOrSlug) => {
    const res = await api.get(`/api/packs/${idOrSlug}`);
    return res.data;
  },

  // Admin
  getAllPacksForAdmin: async () => {
    const res = await api.get('/api/admin/packs');
    return res.data;
  },

  createPack: async (payload) => {
    const res = await api.post('/api/admin/packs', payload);
    return res.data;
  },

  updatePack: async (id, payload) => {
    const res = await api.put(`/api/admin/packs/${id}`, payload);
    return res.data;
  },

  deletePack: async (id) => {
    await api.delete(`/api/admin/packs/${id}`);
  },

  toggleActive: async (id) => {
    const res = await api.patch(`/api/admin/packs/${id}/toggle-active`);
    return res.data;
  },

  toggleFeatured: async (id) => {
    const res = await api.patch(`/api/admin/packs/${id}/toggle-featured`);
    return res.data;
  },

  // Seller Methods
  getSellerPacks: async () => {
    const res = await api.get('/api/seller/packs');
    return res.data;
  },

  createSellerPack: async (payload) => {
    const res = await api.post('/api/seller/packs', payload);
    return res.data;
  },

  updateSellerPack: async (id, payload) => {
    const res = await api.put(`/api/seller/packs/${id}`, payload);
    return res.data;
  },

  deleteSellerPack: async (id) => {
    await api.delete(`/api/seller/packs/${id}`);
  },

  toggleSellerPackActive: async (id) => {
    const res = await api.patch(`/api/seller/packs/${id}/toggle-active`);
    return res.data;
  },
};
