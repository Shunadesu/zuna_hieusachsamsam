import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', token);
      navigate('/');
      window.location.reload();
    } catch (e) {
      setError(e.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 400, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Đăng nhập</h1>
        {error && <p style={{ color: '#c62828', marginBottom: '0.5rem' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" style={{ background: 'var(--green-600)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 8 }}>Đăng nhập</button>
        </form>
        <p style={{ marginTop: '1rem' }}>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      </div>
    </div>
  );
}

const inputStyle = { padding: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' };
