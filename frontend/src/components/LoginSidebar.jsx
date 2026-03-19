import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function LoginSidebar({ open, onClose }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-green-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              className={`px-4 py-2 rounded-lg font-medium ${tab === 'login' ? 'bg-green-800 text-white' : 'bg-green-50 text-green-800'}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              className={`px-4 py-2 rounded-lg font-medium ${tab === 'register' ? 'bg-green-800 text-white' : 'bg-green-50 text-green-800'}`}
            >
              Đăng ký
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-green-200 px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-green-200 px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-green-800 text-white font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-green-200 px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-green-200 px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-green-200 px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-green-200 px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-green-800 text-white font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
