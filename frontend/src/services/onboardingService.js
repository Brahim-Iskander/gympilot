import { api } from './api';

/**
 * Multi-step onboarding API.
 * GET  /onboarding       -> current progress (creates record if missing)
 * POST /onboarding/stepN -> save step N and advance
 * PUT  /onboarding       -> full training-profile update (Settings)
 */
export const onboardingService = {
  get() {
    return api.get('/onboarding').then((response) => response.data);
  },

  saveStep(step, payload) {
    return api.post(`/onboarding/step${step}`, payload).then((response) => response.data);
  },

  updateProfile(payload) {
    return api.put('/onboarding', payload).then((response) => response.data);
  },

  generateAiPlan() {
    return api.post('/onboarding/generate-plan').then((response) => response.data);
  },
};
