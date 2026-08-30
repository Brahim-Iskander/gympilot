import { api } from './api';

export const coachChatService = {
  /**
   * User: Get all messages in user-coach conversation
   */
  getMessages: async () => {
    const response = await api.get('/coach-chat/messages');
    return response.data;
  },

  /**
   * User: Send a message to the coaching team
   */
  sendMessage: async (message) => {
    const response = await api.post('/coach-chat/messages', { message });
    return response.data;
  },

  /**
   * User: Get unread count from coach
   */
  getUnreadCount: async () => {
    const response = await api.get('/coach-chat/unread-count');
    return response.data?.unreadCount || 0;
  },

  /**
   * Admin/Coach: Get all active athlete conversations
   */
  getConversations: async () => {
    const response = await api.get('/admin/coach-chat/conversations');
    return response.data;
  },

  /**
   * Admin/Coach: Get messages for a specific athlete
   */
  getConversationMessages: async (userId) => {
    const response = await api.get(`/admin/coach-chat/conversations/${userId}/messages`);
    return response.data;
  },

  /**
   * Admin/Coach: Send response to an athlete
   */
  sendCoachMessage: async (userId, message) => {
    const response = await api.post(`/admin/coach-chat/conversations/${userId}/messages`, { message });
    return response.data;
  },

  /**
   * Admin/Coach: Get total unread inquiries count
   */
  getAdminUnreadCount: async () => {
    const response = await api.get('/admin/coach-chat/unread-count');
    return response.data?.unreadCount || 0;
  },
};
