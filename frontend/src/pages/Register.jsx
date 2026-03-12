import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/auth/register', { email, password, name, address });
      navigate('/login');
    } catch (e) {
      setError(e.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 400, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Đăng ký</h1>
        {error && <p style={{ color: '#c62828', marginBottom: '0.5rem' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" placeholder="Họ tên" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
          <input type="text" placeholder="Địa chỉ (tùy chọn)" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
          <button type="submit" style={{ background: 'var(--green-600)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 8 }}>Đăng ký</button>
        </form>
        <p style={{ marginTop: '1rem' }}>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
}

const inputStyle = { padding: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' };
