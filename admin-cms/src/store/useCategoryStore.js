import { create } from 'zustand';
import api from '../services/api';

export const useCategoryStore = create((set, get) => ({
  list: [],
  loaded: false,
  fetchCategories: async () => {
    if (get().loaded) return get().list;
    const list = await api.get('/api/categories');
    set({ list: list || [], loaded: true });
    return list || [];
  },
  invalidate: () => set({ loaded: false }),
}));
