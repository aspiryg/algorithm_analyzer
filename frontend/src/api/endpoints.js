import api from './client';

// Auth API methods -- keep these thin; business logic lives in the store.

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

export const graphApi = {
  getAll: () => api.get('/graphs'),
  getOne: (id) => api.get(`/graphs/${id}`),
  create: (data) => api.post('/graphs', data),
  update: (id, data) => api.put(`/graphs/${id}`, data),
  remove: (id) => api.delete(`/graphs/${id}`),
};
