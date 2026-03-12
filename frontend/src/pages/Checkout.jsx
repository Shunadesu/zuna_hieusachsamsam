import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
    api.get('/api/bank-accounts').then(setBankAccounts).catch(() => setBankAccounts([]));
    if (token) {
      api.get('/api/auth/me').then((u) => {
        setName(u.name || '');
        setEmail(u.email || '');
        setAddress(u.address || '');
      }).catch(() => {});
    }
  }, [token]);

  const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      await api.post('/api/orders', {
        guestInfo: token ? undefined : { name, phone, email, address },
        items: items.map((i) => ({ bookId: i._id, title: i.title, price: i.price, quantity: i.qty || 1 })),
        total,
        paymentMethod: 'bank_transfer',
      });
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      if (token) navigate('/orders');
      else { navigate('/'); alert('Đặt hàng thành công. Chúng tôi sẽ liên hệ qua email.'); }
    } catch (err) {
      alert(err.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="page container">
        <p>Giỏ hàng trống. <a href="/books">Mua sách</a></p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        <h1 style={{ marginBottom: '1rem' }}>Thanh toán</h1>
        {!token && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <input type="text" placeholder="Họ tên" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
            <p>Tổng: {total.toLocaleString('vi-VN')} ₫</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Thanh toán chuyển khoản: chuyển vào một trong các tài khoản dưới đây, admin sẽ xác nhận sau.</p>
            {bankAccounts.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--green-50)', borderRadius: 8 }}>
                {bankAccounts.map((b) => (
                  <div key={b._id} style={{ marginBottom: '1rem' }}>
                    <strong>{b.bankName}</strong> — {b.accountNumber} — {b.accountHolder}
                    {b.qrImage && <img src={b.qrImage.startsWith('http') ? b.qrImage : API_URL + b.qrImage} alt="QR" style={{ display: 'block', marginTop: 4, width: 120, height: 120 }} />}
                  </div>
                ))}
              </div>
            )}
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Đang xử lý...' : 'Đặt hàng'}</button>
          </form>
        )}
        {token && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Họ tên" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
            <p>Tổng: {total.toLocaleString('vi-VN')} ₫</p>
            {bankAccounts.length > 0 && (
              <div style={{ padding: '1rem', background: 'var(--green-50)', borderRadius: 8 }}>
                <strong>Chuyển khoản vào:</strong>
                {bankAccounts.map((b) => (
                  <div key={b._id} style={{ marginTop: 8 }}>
                    {b.bankName} — {b.accountNumber} — {b.accountHolder}
                    {b.qrImage && <img src={b.qrImage.startsWith('http') ? b.qrImage : API_URL + b.qrImage} alt="QR" style={{ display: 'block', marginTop: 4, width: 120, height: 120 }} />}
                  </div>
                ))}
              </div>
            )}
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Đang xử lý...' : 'Đặt hàng'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = { padding: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' };
const btnStyle = { background: 'var(--green-600)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 8, fontWeight: 600 };
