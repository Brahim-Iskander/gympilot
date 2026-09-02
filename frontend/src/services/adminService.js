import { api } from './api';

export const adminService = {
  getDashboardStats() {
    return api.get('/admin/dashboard').then((res) => res.data);
  },

  getUsers(params = {}) {
    return api.get('/admin/users', { params }).then((res) => res.data);
  },

  getUserById(id) {
    return api.get(`/admin/users/${id}`).then((res) => res.data);
  },

  banUser(id) {
    return api.post(`/admin/users/${id}/ban`).then((res) => res.data);
  },

  unbanUser(id) {
    return api.post(`/admin/users/${id}/unban`).then((res) => res.data);
  },

  updateUserRole(id, role) {
    return api.patch(`/admin/users/${id}/role`, { role }).then((res) => res.data);
  },

  updateUserCapabilities(id, { roles, isSeller, isCoach, isAdmin, notes }) {
    return api.patch(`/admin/users/${id}/roles`, { roles, isSeller, isCoach, isAdmin, notes }).then((res) => res.data);
  },

  getRoleAuditLogs(params = {}) {
    return api.get('/admin/roles/audit-logs', { params }).then((res) => res.data);
  },

  updateUserMembership(id, { membershipTier, membershipStatus }) {
    return api.patch(`/admin/users/${id}/membership`, { membershipTier, membershipStatus }).then((res) => res.data);
  },

  getVisitorAnalytics(period = 'daily') {
    return api.get('/admin/analytics/visitors', { params: { period } }).then((res) => res.data);
  },

  getRegistrationAnalytics(period = 'daily') {
    return api.get('/admin/analytics/registrations', { params: { period } }).then((res) => res.data);
  },

  getTickets(params = {}) {
    return api.get('/admin/tickets', { params }).then((res) => res.data);
  },

  getTicketById(id) {
    return api.get(`/admin/tickets/${id}`).then((res) => res.data);
  },

  replyToTicket(id, { message, imageBase64, imageType }) {
    return api.post(`/admin/tickets/${id}/reply`, { message, imageBase64, imageType }).then((res) => res.data);
  },

  closeTicket(id) {
    return api.post(`/admin/tickets/${id}/close`).then((res) => res.data);
  },

  reopenTicket(id) {
    return api.post(`/admin/tickets/${id}/reopen`).then((res) => res.data);
  },

  markTicketRead(id) {
    return api.post(`/admin/tickets/${id}/read`).then((res) => res.data);
  },

  getTicketUnreadCount() {
    return api.get('/admin/tickets/unread-count').then((res) => res.data);
  },

  getTicketStats() {
    return api.get('/admin/tickets/stats').then((res) => res.data);
  },
};

