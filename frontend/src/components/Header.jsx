import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import SearchBar from './SearchBar';

export default function Header({ onOpenLogin, onOpenCart }) {
  const { user, logout } = useAuthStore();
  const { cartItems } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/sach', label: 'Sách' },
    { to: '/ban-sach', label: 'Bán sách cho cửa hàng' },
    { to: '/gio-hang', label: 'Giỏ hàng' },
  ];
  if (user) {
    navLinks.push({ to: '/don-hang', label: 'Đơn hàng của tôi' });
  }

  return (
    <header className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link to="/" className="text-xl font-bold text-green-800 shrink-0">
            Sách Truyện Mỹ Hạnh
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 text-green-800 hover:bg-green-50 rounded-lg transition"
              aria-label="Giỏ hàng"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">{user.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-green-800 hover:text-green-700 font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-sm font-medium text-green-800 hover:text-green-700 border border-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition"
              >
                Đăng nhập / Đăng ký
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 text-green-800"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        
      </div>
    </header>
  );
}
