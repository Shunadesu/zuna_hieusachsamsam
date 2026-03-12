import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('adminToken'),
  user: null,
  setToken: (token) => {
    if (token) localStorage.setItem('adminToken', token);
    else localStorage.removeItem('adminToken');
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('adminToken');
    set({ token: null, user: null });
  },
}));
