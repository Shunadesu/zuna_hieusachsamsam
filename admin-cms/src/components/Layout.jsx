import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiBarChart2, FiLogOut, FiMenu, FiX, FiChevronRight,
  FiBookOpen, FiGrid, FiShoppingCart, FiTag,
  FiCreditCard, FiImage,   FiSettings, FiTrendingUp, FiSend, FiExternalLink,
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const NAV_SECTIONS = [
  {
    group: 'Tổng quan',
    items: [
      { to: '/', end: true, icon: FiBarChart2, label: 'Dashboard' },
    ],
  },
  {
    group: 'Quản lý nội dung',
    items: [
      { to: '/books', icon: FiBookOpen, label: 'Sách' },
      { to: '/categories', icon: FiGrid, label: 'Thể loại' },
      { to: '/sliders', icon: FiImage, label: 'Slider & Banner' },
    ],
  },
  {
    group: 'Kinh doanh',
    items: [
      { to: '/orders', icon: FiShoppingCart, label: 'Đơn hàng' },
      { to: '/promotions', icon: FiTag, label: 'Khuyến mãi' },
      { to: '/sell-requests', icon: FiSend, label: 'Yêu cầu bán sách' },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { to: '/bank-accounts', icon: FiCreditCard, label: 'Tài khoản ngân hàng' },
      { to: '/site-config', icon: FiSettings, label: 'Cấu hình site' },
      { to: '/reports', icon: FiTrendingUp, label: 'Báo cáo' },
    ],
  },
];

const PAGE_TITLES = {
  '/': 'Tổng quan',
  '/books': 'Sách',
  '/categories': 'Thể loại',
  '/orders': 'Đơn hàng',
  '/promotions': 'Khuyến mãi',
  '/bank-accounts': 'Tài khoản ngân hàng',
  '/sliders': 'Slider & Banner',
  '/site-config': 'Cấu hình site',
  '/reports': 'Báo cáo doanh số',
  '/sell-requests': 'Yêu cầu bán sách',
  '/books/add': 'Thêm sách mới',
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/books/edit/')) return 'Sửa sách';
  return pathname.slice(1).replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function Sidebar({ open, onClose }) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-slate-900
          transform transition-transform duration-200 ease-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <FiBookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">Hiệu sách</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Admin CMS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.group} className="mb-5">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.group}
              </p>
              {section.items.map(({ to, end, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2 mb-0.5 text-sm transition-all duration-100 ${
                      isActive
                        ? 'bg-white/15 text-white font-medium'
                        : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`
                  }
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          >
            <FiLogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-400">Hiệu sách</span>
              <FiChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-medium text-slate-800">{title}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              <FiExternalLink className="h-3 w-3" />
              Xem website
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
