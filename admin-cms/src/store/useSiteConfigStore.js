import { create } from 'zustand';
import api from '../services/api';

export const useSiteConfigStore = create((set, get) => ({
  config: null,
  loaded: false,
  fetchConfig: async () => {
    if (get().loaded) return get().config;
    const config = await api.get('/api/site/config');
    set({ config, loaded: true });
    return config;
  },
  invalidate: () => set({ loaded: false }),
}));
