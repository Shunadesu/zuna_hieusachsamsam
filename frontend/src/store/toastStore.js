import { create } from 'zustand';

export const useToastStore = create((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    setTimeout(() => set({ message: null }), 3000);
  },
  hide: () => set({ message: null }),
}));
