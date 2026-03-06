import { create } from 'zustand';
import { authApi } from '../api/endpoints';

/*
  Auth store -- manages login state, user data, and token persistence.
  
  We persist tokens in localStorage so the session survives page reloads.
  The actual HTTP calls go through the api client, which also handles
  token refresh via interceptors.
*/
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true, // true until the initial auth check finishes
  error: null,

  // Try to restore the session on app load
  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ loading: false, isAuthenticated: false });
      return;
    }
    try {
      const { data } = await authApi.getMe();
      set({ user: data.user, isAuthenticated: true, loading: false, error: null });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  register: async (userData) => {
    set({ error: null });
    try {
      const { data } = await authApi.register(userData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true, error: null });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ error: message });
      throw err;
    }
  },

  login: async (credentials) => {
    set({ error: null });
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true, error: null });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      set({ error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the API call fails, clear local state
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
