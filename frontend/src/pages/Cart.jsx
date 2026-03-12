import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const [items, setItems] = useState([]);

  const loadCart = () => setItems(JSON.parse(localStorage.getItem('cart') || '[]'));

  useEffect(() => {
    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const updateQty = (id, delta) => {
    const cart = items.map((i) => (i._id === id ? { ...i, qty: Math.max(0, (i.qty || 1) + delta) } : i)).filter((i) => i.qty > 0);
    localStorage.setItem('cart', JSON.stringify(cart));
    setItems(cart);
    window.dispatchEvent(new Event('storage'));
  };

  const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Giỏ hàng</h1>
        {items.length === 0 ? (
          <p>Giỏ hàng trống. <Link to="/books">Mua sách</Link></p>
        ) : (
          <>
            <ul style={{ listStyle: 'none' }}>
              {items.map((i) => (
                <li key={i._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{i.title}</span>
                  <span>{(i.price || 0).toLocaleString('vi-VN')} ₫</span>
                  <button type="button" onClick={() => updateQty(i._id, -1)}>−</button>
                  <span>{i.qty || 1}</span>
                  <button type="button" onClick={() => updateQty(i._id, 1)}>+</button>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Tổng: {total.toLocaleString('vi-VN')} ₫</p>
            <Link to="/checkout" style={{ display: 'inline-block', marginTop: '1rem', background: 'var(--green-600)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 8 }}>Thanh toán</Link>
          </>
        )}
      </div>
    </div>
  );
}
