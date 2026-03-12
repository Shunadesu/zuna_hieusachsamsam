import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    api.get('/api/orders/my').then((data) => setOrders(Array.isArray(data) ? data : data.data || [])).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [token]);

  if (!token) return <div className="page container"><p>Vui lòng <a href="/login">đăng nhập</a> để xem đơn hàng.</p></div>;
  if (loading) return <div className="page container"><p>Đang tải...</p></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Đơn hàng của tôi</h1>
        {orders.length === 0 ? <p>Chưa có đơn hàng.</p> : (
          <ul style={{ listStyle: 'none' }}>
            {orders.map((o) => (
              <li key={o._id} style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 8, marginBottom: '0.5rem', border: '1px solid var(--border)' }}>
                <strong>#{o._id?.slice(-6)}</strong> — {Number(o.total || 0).toLocaleString('vi-VN')} ₫ — {o.status || 'pending'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
