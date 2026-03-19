import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addItem: (book, quantity = 1) => {
        const normalizedOriginalPrice =
          Number(book.originalPrice || 0) > Number(book.price || 0) ? Number(book.originalPrice) : null;
        const item = {
          bookId: book._id,
          title: book.title,
          slug: book.slug,
          price: Number(book.price || 0),
          originalPrice: normalizedOriginalPrice,
          quantity,
          image: book.image,
        };
        set((state) => {
          const existing = state.cartItems.find((i) => i.bookId === book._id);
          let next;
          if (existing) {
            next = state.cartItems.map((i) =>
              i.bookId === book._id
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    price: Number(book.price || i.price || 0),
                    originalPrice: normalizedOriginalPrice,
                  }
                : i
            );
          } else {
            next = [...state.cartItems, item];
          }
          return { cartItems: next };
        });
      },

      removeItem: (bookId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.bookId !== bookId),
        }));
      },

      updateQuantity: (bookId, quantity) => {
        if (quantity < 1) {
          get().removeItem(bookId);
          return;
        }
        set((state) => ({
          cartItems: state.cartItems.map((i) =>
            i.bookId === bookId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ cartItems: [] }),

      getTotalPrice: () =>
        get().cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
