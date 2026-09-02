import { api } from './api';

export const productService = {
  getProducts(params = {}) {
    return api.get('/products', { params }).then((res) => res.data);
  },

  getProductById(id) {
    return api.get(`/products/${id}`).then((res) => res.data);
  },

  getFeatured() {
    return api.get('/products/featured').then((res) => res.data);
  },

  getBestSellers() {
    return api.get('/products/bestsellers').then((res) => res.data);
  },

  getRelated(id, limit = 4) {
    return api.get(`/products/${id}/related`, { params: { limit } }).then((res) => res.data);
  },

  createProduct(payload) {
    return api.post('/products', payload).then((res) => res.data);
  },

  updateProduct(id, payload) {
    return api.put(`/products/${id}`, payload).then((res) => res.data);
  },

  toggleActive(id) {
    return api.patch(`/products/${id}/toggle-active`).then((res) => res.data);
  },

  deleteProduct(id) {
    return api.delete(`/products/${id}`).then((res) => res.data);
  },
};
