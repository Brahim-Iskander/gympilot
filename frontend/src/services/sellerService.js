import { api } from './api';

export const sellerService = {
  getStats() {
    return api.get('/seller/stats').then((res) => res.data);
  },

  getMyProducts(params = {}) {
    return api.get('/seller/products', { params }).then((res) => res.data);
  },

  getOrders(params = {}) {
    return api.get('/seller/orders', { params }).then((res) => res.data);
  },

  updateOrderStatus(orderId, { status, notes }) {
    return api.patch(`/seller/orders/${orderId}/status`, { status, notes }).then((res) => res.data);
  },

  updateStoreProfile(payload) {
    return api.patch('/seller/profile', payload).then((res) => res.data);
  },
};
