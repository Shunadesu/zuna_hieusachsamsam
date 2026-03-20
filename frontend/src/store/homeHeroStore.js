import { create } from 'zustand';

/**
 * Trạng thái UI trang chủ: hero (sidebar + slider) và dải "Thư mục sách".
 */
export const useHomeHeroStore = create((set) => ({
  heroDataReady: false,
  /** Danh mục đã fetch xong (có thể sớm hơn hero khi slider còn tải). */
  categoryStripReady: false,

  setHeroDataReady: (ready) => set({ heroDataReady: Boolean(ready) }),
  setCategoryStripReady: (ready) => set({ categoryStripReady: Boolean(ready) }),

  /** Đặt lại khi rời Home để lần vào sau có thể hiện skeleton trong lúc tải lại. */
  resetHomeHero: () => set({ heroDataReady: false, categoryStripReady: false }),
}));
