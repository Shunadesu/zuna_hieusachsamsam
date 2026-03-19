import { create } from 'zustand';
import api from '../services/api';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store').replace(/\/$/, '');

const toAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') return value;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  if (value.startsWith('/')) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/${value}`;
};

const normalizeBook = (book) => {
  if (!book || typeof book !== 'object') return book;
  const normalizedImages = Array.isArray(book.images) ? book.images.map((img) => toAbsoluteUrl(img)) : book.images;
  return {
    ...book,
    image: toAbsoluteUrl(book.image),
    images: normalizedImages,
  };
};

const normalizeCategory = (cat) => {
  if (!cat || typeof cat !== 'object') return cat;
  return { ...cat, image: toAbsoluteUrl(cat.image) };
};

const normalizeSlider = (slider) => {
  if (!slider || typeof slider !== 'object') return slider;
  return { ...slider, image: toAbsoluteUrl(slider.image) };
};

const normalizeBankAccount = (account) => {
  if (!account || typeof account !== 'object') return account;
  return { ...account, qrImage: toAbsoluteUrl(account.qrImage) };
};

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
      set({ books: (data.data || []).map(normalizeBook), loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchHotBooks: async (limit = 12) => {
    try {
      const { data } = await api.get('/api/books', { params: { isHot: true, limit, page: 1 } });
      set({ hotBooks: (data.data || []).map(normalizeBook) });
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
      set({ bookDetail: normalizeBook(data), loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/api/categories');
      set({ categories: (data || []).map(normalizeCategory) });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchSliders: async () => {
    try {
      const { data } = await api.get('/api/sliders');
      set({ sliders: (data || []).map(normalizeSlider) });
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
      set({ bankAccounts: (data || []).map(normalizeBankAccount) });
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
