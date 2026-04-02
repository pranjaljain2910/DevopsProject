/**
 * Axios API Client
 * 
 * Centralized HTTP client. In development, Vite's proxy rewrites
 * /api/* to the backend on port 5000. In production, configure
 * the base URL via environment variable.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── API helpers organized by resource ──────────────────────

export const usersAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const teamsAPI = {
  list: () => api.get('/teams'),
  create: (data) => api.post('/teams', data),
  delete: (id) => api.delete(`/teams/${id}`),
};

export const rulesAPI = {
  list: () => api.get('/rules'),
  create: (data) => api.post('/rules', data),
  update: (id, data) => api.put(`/rules/${id}`, data),
  delete: (id) => api.delete(`/rules/${id}`),
};

export const alertsAPI = {
  list: (params) => api.get('/alerts', { params }),
  create: (data) => api.post('/alerts', data),
  acknowledge: (id) => api.patch(`/alerts/${id}/acknowledge`),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
  logs: (id) => api.get(`/alerts/${id}/logs`),
};

export const policiesAPI = {
  list: () => api.get('/policies'),
  create: (data) => api.post('/policies', data),
  delete: (id) => api.delete(`/policies/${id}`),
};

export default api;
