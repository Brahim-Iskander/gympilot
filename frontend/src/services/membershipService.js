import { api } from './api';

export const membershipService = {
  /**
   * Redeem reward points for a 1-month subscription (BASIC or PREMIUM).
   * @param {'BASIC'|'PREMIUM'} tier
   */
  redeemPlanWithPoints(tier) {
    return api.post('/membership/redeem-points', { tier }).then((res) => res.data);
  },
};
