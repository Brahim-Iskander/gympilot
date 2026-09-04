import { api } from './api';

export const aiPhotoAnalysisService = {
  /**
   * Public photo & goal analysis.
   * @param {Object} payload
   * @param {string} payload.imageBase64 - Base64 encoded image string (or data URI)
   * @param {string} payload.goal - Short goal text (e.g. "build muscle", "lose belly fat")
   * @returns {Promise<Object>} { summary, nutritionTips, adviceSteps, recommendedProducts, disclaimer }
   */
  analyzeGoalPhoto: async ({ imageBase64, goal }) => {
    const response = await api.post('/api/analyze', {
      imageBase64,
      goal,
    });
    return response.data;
  },
};
