import { api } from './api';

export const communityChatService = {
  /**
   * Fetch recent community messages.
   */
  async getMessages() {
    const response = await api.get('/community-chat/messages');
    return response.data;
  },

  /**
   * Send a community message.
   */
  async sendMessage(message) {
    const response = await api.post('/community-chat/messages', { message });
    return response.data;
  },
};
