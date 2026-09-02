import { api } from './api';

export const orderService = {
  createOrder(payload) {
    return api.post('/orders', payload).then((res) => res.data);
  },

  getMyOrders(params = {}) {
    return api.get('/orders/my-orders', { params }).then((res) => res.data);
  },

  getOrderById(id) {
    return api.get(`/orders/${id}`).then((res) => res.data);
  },
};
