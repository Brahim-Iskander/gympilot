import { api } from './api';

export const aiCreditService = {
  /**
   * Fetch available AI credit packs with prices in TND and loyalty points.
   */
  async getPacks() {
    const res = await api.get('/ai/credits/packs');
    return res.data;
  },

  /**
   * Get authenticated user's current AI credits & points balance.
   */
  async getBalance() {
    const res = await api.get('/ai/credits/balance');
    return res.data;
  },

  /**
   * Instant simulated purchase (adds credits immediately).
   */
  async purchaseInstant(packId) {
    const res = await api.post('/ai/credits/purchase-instant', {
      packId,
      paymentMethod: 'INSTANT_CARD',
    });
    return res.data;
  },

  /**
   * Redeem loyalty reward points for AI credits.
   */
  async redeemPoints(packId) {
    const res = await api.post('/ai/credits/redeem-points', {
      packId,
      paymentMethod: 'REWARD_POINTS',
    });
    return res.data;
  },
};
