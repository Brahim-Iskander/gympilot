import { api } from './api';

export const aiPhotoAnalysisService = {
  /**
   * Public photo & goal analysis — supports multiple photos.
   * @param {Object} payload
   * @param {string[]} payload.imagesBase64 - Array of base64 encoded image strings (or data URIs)
   * @param {string} payload.goal - Short goal text (e.g. "build muscle", "lose belly fat")
   * @returns {Promise<Object>} { summary, nutritionTips, adviceSteps, recommendedProducts, disclaimer }
   */
  analyzeGoalPhoto: async ({ imagesBase64, goal }) => {
    const response = await api.post('/api/analyze', {
      imagesBase64,
      goal,
    });
    return response.data;
  },
};
