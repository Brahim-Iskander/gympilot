import { paymentService } from './paymentService';

export const d17Service = {
  getConfig: paymentService.getD17Config,
  submitPaymentProof: paymentService.submitPaymentProof,
  getMyPayments: paymentService.getMyPayments,
  getAdminPayments: paymentService.getAdminPayments,
  getAdminStats: paymentService.getAdminStats,
  getPendingCount: paymentService.getPendingCount,
  approvePayment: paymentService.approvePayment,
  rejectPayment: paymentService.rejectPayment,
  updateConfig: paymentService.updateD17Config,
};
