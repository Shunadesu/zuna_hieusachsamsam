import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        set({ user: data.user, token: data.token });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      },

      register: async (name, email, password, phone, address) => {
        const { data } = await api.post('/api/auth/register', {
          name,
          email,
          password,
          ...(phone && { phone }),
          ...(address && { address }),
        });
        set({ user: data.user, token: data.token });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const { data } = await api.get('/api/auth/me');
        set({ user: data });
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      },

      hydrate: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            set({ token, user: JSON.parse(userStr) });
          } catch (_) {}
        }
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
