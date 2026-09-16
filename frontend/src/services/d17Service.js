import { api } from './api';

export const d17Service = {
  /**
   * Fetch public D17 configuration (receiving phone number, recipient label, instructions)
   */
  async getConfig() {
    const res = await api.get('/payments/d17/config');
    return res.data;
  },

  /**
   * Submit payment proof (subscription or order)
   */
  async submitPaymentProof(payload) {
    const res = await api.post('/payments/d17/submit', payload);
    return res.data;
  },

  /**
   * Get authenticated user's submitted D17 payments
   */
  async getMyPayments() {
    const res = await api.get('/payments/d17/my-tickets');
    return res.data;
  },

  /**
   * Admin: get filterable list of D17 payments
   */
  async getAdminPayments({ status, search, sort } = {}) {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;
    if (sort) params.sort = sort;

    const res = await api.get('/admin/payments/d17', { params });
    return res.data;
  },

  /**
   * Admin: get payment metrics & SLA indicators
   */
  async getAdminStats() {
    const res = await api.get('/admin/payments/d17/stats');
    return res.data;
  },

  /**
   * Admin: get count of pending D17 payments for badges
   */
  async getPendingCount() {
    const res = await api.get('/admin/payments/d17/pending-count');
    return res.data?.pendingCount ?? 0;
  },

  /**
   * Admin: approve a pending payment
   */
  async approvePayment(ticketId, adminNotes = '') {
    const res = await api.post(`/admin/payments/d17/${ticketId}/approve`, { adminNotes });
    return res.data;
  },

  /**
   * Admin: reject a pending payment with mandatory reason
   */
  async rejectPayment(ticketId, reason, adminNotes = '') {
    const res = await api.post(`/admin/payments/d17/${ticketId}/reject`, { reason, adminNotes });
    return res.data;
  },

  /**
   * Admin: update receiving phone number and settings
   */
  async updateConfig(payload) {
    const res = await api.put('/admin/payments/d17/config', payload);
    return res.data;
  },
};
