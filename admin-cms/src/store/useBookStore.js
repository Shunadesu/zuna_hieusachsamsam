import { create } from 'zustand';
import api from '../services/api';

function buildQuery(params) {
  const p = new URLSearchParams();
  if (params.page != null) p.set('page', params.page);
  if (params.limit != null) p.set('limit', params.limit);
  if (params.search) p.set('search', params.search);
  if (params.categoryId) p.set('categoryId', params.categoryId);
  if (params.minPrice !== '' && params.minPrice != null) p.set('minPrice', params.minPrice);
  if (params.maxPrice !== '' && params.maxPrice != null) p.set('maxPrice', params.maxPrice);
  if (params.minQuantity !== '' && params.minQuantity != null) p.set('minQuantity', params.minQuantity);
  if (params.maxQuantity !== '' && params.maxQuantity != null) p.set('maxQuantity', params.maxQuantity);
  return p.toString();
}

export const useBookStore = create((set, get) => ({
  list: [],
  total: 0,
  page: 1,
  limit: 10,
  loaded: false,
  fetchBooks: async (params = {}) => {
    const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice, minQuantity, maxQuantity } = params;
    const q = buildQuery({ page, limit, search, categoryId, minPrice, maxPrice, minQuantity, maxQuantity });
    const res = await api.get(`/api/books?${q}`);
    const data = res.data || [];
    const total = res.total ?? 0;
    set({ list: data, total, page: res.page ?? page, limit: res.limit ?? limit, loaded: true });
    return { data, total, page: res.page ?? page, limit: res.limit ?? limit };
  },
  invalidate: () => set({ loaded: false }),
}));
