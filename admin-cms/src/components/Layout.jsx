import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiBarChart2, FiLogOut } from 'react-icons/fi';
import { MdSettings } from 'react-icons/md';
import { FaBook, FaList, FaMoneyCheckAlt, FaImages, FaHandHoldingUsd, FaTags, FaShoppingCart } from 'react-icons/fa';

const nav = [
  { to: '/', end: true, icon: FiBarChart2, label: 'Tổng quan' },
  { to: '/books', icon: FaBook, label: 'Sách' },
  { to: '/categories', icon: FaList, label: 'Thể loại' },
  { to: '/orders', icon: FaShoppingCart, label: 'Đơn hàng' },
  { to: '/promotions', icon: FaTags, label: 'Khuyến mãi' },
  { to: '/bank-accounts', icon: FaMoneyCheckAlt, label: 'Tài khoản ngân hàng' },
  { to: '/sliders', icon: FaImages, label: 'Slider' },
  { to: '/site-config', icon: MdSettings, label: 'Cấu hình site' },
  { to: '/reports', icon: FiBarChart2, label: 'Báo cáo' },
  { to: '/sell-requests', icon: FaHandHoldingUsd, label: 'Yêu cầu bán sách' },
];

export default function Layout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-[240px] min-w-[240px] flex flex-col bg-[#263238] shadow">
        <div className="px-3 py-2 text-xs font-bold text-white border-b border-white/10">Hiệu sách – Admin</div>
        <nav className="flex-1 overflow-y-auto p-1.5">
          {nav.map(({ to, end, icon: Icon, label }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                'flex items-center gap-2 py-1.5 px-2.5 text-[0.75rem] rounded-md transition ' +
                (isActive
                  ? 'bg-white/10 text-white border-l-2 border-green-500 pl-[calc(0.5rem-2px)]'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white')
              }
            >
              <Icon size={12} /> <span>{i + 1}. {label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-1.5 py-2 px-2.5 w-full text-[0.75rem] text-slate-200 border-t border-white/10 hover:bg-white/10 hover:text-white bg-transparent cursor-pointer text-left"
        >
          <FiLogOut size={12} /> Đăng xuất
        </button>
      </aside>
      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
