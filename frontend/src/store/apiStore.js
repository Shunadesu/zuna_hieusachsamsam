import { create } from 'zustand';
import api from '../services/api';

export const useApiStore = create((set, get) => ({
  books: [],
  hotBooks: [],
  bookDetail: null,
  categories: [],
  sliders: [],
  promotions: [],
  siteConfig: null,
  bankAccounts: [],
  loading: false,
  error: null,

  fetchBooks: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/api/books', { params });
      set({ books: data.data || [], loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchHotBooks: async (limit = 12) => {
    try {
      const { data } = await api.get('/api/books', { params: { isHot: true, limit, page: 1 } });
      set({ hotBooks: data.data || [] });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchBookDetail: async (idOrSlug) => {
    set({ loading: true, error: null, bookDetail: null });
    try {
      const isSlug = typeof idOrSlug === 'string' && !idOrSlug.match(/^[0-9a-fA-F]{24}$/);
      const url = isSlug ? `/api/books/slug/${idOrSlug}` : `/api/books/${idOrSlug}`;
      const { data } = await api.get(url);
      set({ bookDetail: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/api/categories');
      set({ categories: data || [] });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchSliders: async () => {
    try {
      const { data } = await api.get('/api/sliders');
      set({ sliders: data || [] });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchPromotions: async () => {
    try {
      const { data } = await api.get('/api/promotions');
      set({ promotions: data || [] });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchSiteConfig: async () => {
    try {
      const { data } = await api.get('/api/site/config');
      set({ siteConfig: data });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchBankAccounts: async () => {
    try {
      const { data } = await api.get('/api/bank-accounts');
      set({ bankAccounts: data || [] });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
