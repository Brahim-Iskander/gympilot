import { api } from './api';

export const ticketService = {
  /** Create a new support ticket */
  createTicket({ subject, topic, message, imageBase64, imageType }) {
    return api.post('/tickets', { subject, topic, message, imageBase64, imageType }).then((res) => res.data);
  },

  /** Get all tickets belonging to logged-in user */
  getMyTickets() {
    return api.get('/tickets').then((res) => res.data);
  },

  /** Get full ticket conversation by ID */
  getTicket(id) {
    return api.get(`/tickets/${id}`).then((res) => res.data);
  },

  /** Reply to a ticket */
  replyToTicket(id, { message, imageBase64, imageType }) {
    return api.post(`/tickets/${id}/reply`, { message, imageBase64, imageType }).then((res) => res.data);
  },

  /** Close a ticket */
  closeTicket(id) {
    return api.post(`/tickets/${id}/close`).then((res) => res.data);
  },

  /** Reopen a closed ticket */
  reopenTicket(id) {
    return api.post(`/tickets/${id}/reopen`).then((res) => res.data);
  },

  /** Mark ticket as read */
  markRead(id) {
    return api.post(`/tickets/${id}/read`).then((res) => res.data);
  },
};
