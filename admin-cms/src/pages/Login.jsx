import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (data.user?.role !== 'admin') {
        setError('Chỉ tài khoản admin mới đăng nhập được.');
        return;
      }
      setToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch (e) {
      setError(e.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#263238]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-[380px] p-8">
        <h1 className="text-gray-800 font-bold mb-1">Admin CMS</h1>
        <p className="text-gray-500 mb-6">Đăng nhập quản trị</p>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button type="submit" className="w-full bg-gray-700 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-600">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
