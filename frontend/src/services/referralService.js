import { api } from './api';

export const referralService = {
  /**
   * Protected: Get authenticated user's referral code, link, points, friends, and ledger.
   */
  getReferralStats() {
    return api.get('/referrals/stats').then((response) => response.data);
  },

  /**
   * Public: Validate a referral code during signup preview.
   */
  validateReferralCode(code) {
    return api.get('/referrals/validate', { params: { code } }).then((response) => response.data);
  },
};
