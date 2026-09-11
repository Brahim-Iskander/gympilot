import { api } from './api';

export const aiService = {
  async chat(message) {
    try {
      const response = await api.post('/ai/chat', { message });
      return response.data.response;
    } catch (error) {
      console.error('Error communicating with AI:', error);
      throw new Error('Failed to get a response from the AI.');
    }
  },

  async getAiAnalytics() {
    try {
      const response = await api.get('/ai/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      return null;
    }
  },

  async analyzeProgress() {
    try {
      const response = await api.post('/progress/analyze');
      return response.data;
    } catch (error) {
      console.error('Error running AI progress analysis:', error);
      throw error;
    }
  },

  async analyzeFood(prompt, imageBase64) {
    try {
      const response = await api.post('/ai/analyze-food', { prompt, image: imageBase64 });
      return response.data;
    } catch (error) {
      console.error('Error analyzing food with AI:', error);
      throw error;
    }
  },

  async generateTunisianMealPlan(options = {}) {
    try {
      const response = await api.post('/ai/meal-planner/generate', options);
      return response.data;
    } catch (error) {
      console.error('Error generating Tunisian meal plan:', error);
      throw error;
    }
  },

  async getUsageStatus() {
    try {
      const response = await api.get('/ai/usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI usage status:', error);
      return null;
    }
  },
};

