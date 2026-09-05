import { api } from './api';

export const sellerEarningsService = {
  getOverview(params = {}) {
    return api.get('/admin/seller-earnings', { params }).then((res) => res.data);
  },

  getSellerDetail(sellerId, params = {}) {
    return api.get(`/admin/seller-earnings/${sellerId}`, { params }).then((res) => res.data);
  },

  recordPayout(sellerId, payoutData) {
    return api.post(`/admin/seller-earnings/${sellerId}/payouts`, payoutData).then((res) => res.data);
  },

  updateCommission(sellerId, commissionRate) {
    return api.patch(`/admin/seller-earnings/${sellerId}/commission`, { commissionRate }).then((res) => res.data);
  },
};
