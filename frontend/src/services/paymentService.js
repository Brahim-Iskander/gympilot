import { api } from './api';

export const paymentService = {
  /**
   * Fetch active payment methods for a specific country (e.g. 'TN', 'US', 'FR')
   */
  async getActiveMethods(country = 'TN') {
    const res = await api.get('/payments/methods', {
      params: { country: country || 'TN' },
    });
    return res.data;
  },

  /**
   * Admin: Get all configured payment methods with regional toggles
   */
  async getAdminMethods() {
    const res = await api.get('/admin/payments/methods');
    return res.data;
  },

  /**
   * Admin: Update method configuration, wallet address, instructions, and toggles
   */
  async updateMethod(code, payload) {
    const res = await api.put(`/admin/payments/methods/${code}`, payload);
    return res.data;
  },

  /**
   * Submit payment proof (D17, USDT_TRC20, BTC, ETH) for subscription, order, or AI credit
   */
  async submitPaymentProof(payload) {
    const res = await api.post('/payments/d17/submit', payload);
    return res.data;
  },

  /**
   * Get authenticated user's submitted payment tickets
   */
  async getMyPayments() {
    const res = await api.get('/payments/d17/my-tickets');
    return res.data;
  },

  /**
   * Admin: Get filterable list of payments (supports status, search, sort, and method filter)
   */
  async getAdminPayments({ status, search, sort, method } = {}) {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (method && method !== 'ALL') params.method = method;

    const res = await api.get('/admin/payments/d17', { params });
    return res.data;
  },

  /**
   * Admin: Get payment metrics & SLA indicators
   */
  async getAdminStats() {
    const res = await api.get('/admin/payments/d17/stats');
    return res.data;
  },

  /**
   * Admin: Get count of pending payments for badges
   */
  async getPendingCount() {
    const res = await api.get('/admin/payments/d17/pending-count');
    return res.data?.pendingCount ?? 0;
  },

  /**
   * Admin: Approve a pending payment
   */
  async approvePayment(ticketId, adminNotes = '') {
    const res = await api.post(`/admin/payments/d17/${ticketId}/approve`, { adminNotes });
    return res.data;
  },

  /**
   * Admin: Reject a pending payment with mandatory reason
   */
  async rejectPayment(ticketId, reason, adminNotes = '') {
    const res = await api.post(`/admin/payments/d17/${ticketId}/reject`, { reason, adminNotes });
    return res.data;
  },

  /**
   * Legacy / compatibility: Fetch D17 config
   */
  async getD17Config() {
    const res = await api.get('/payments/d17/config');
    return res.data;
  },

  /**
   * Legacy / compatibility: Update D17 config
   */
  async updateD17Config(payload) {
    const res = await api.put('/admin/payments/d17/config', payload);
    return res.data;
  },
};
