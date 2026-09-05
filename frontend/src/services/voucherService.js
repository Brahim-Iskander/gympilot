import { api } from './api';

export const voucherService = {
  // Customer validation endpoint
  validateVoucher: async (code, orderAmount) => {
    const response = await api.post('/vouchers/validate', {
      code,
      orderAmount: Number(orderAmount) || 0,
    });
    return response.data;
  },

  // Admin endpoints
  getAdminVouchers: async () => {
    const response = await api.get('/admin/vouchers');
    return response.data;
  },

  createAdminVoucher: async (voucherData) => {
    const response = await api.post('/admin/vouchers', voucherData);
    return response.data;
  },

  toggleAdminVoucher: async (id) => {
    const response = await api.patch(`/admin/vouchers/${id}/toggle`);
    return response.data;
  },

  deleteAdminVoucher: async (id) => {
    await api.delete(`/admin/vouchers/${id}`);
  },

  getVoucherOrders: async (code) => {
    const response = await api.get(`/admin/vouchers/${code}/orders`);
    return response.data;
  },
};
