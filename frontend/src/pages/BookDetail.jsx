import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.get(`/api/books/slug/${slug}`)
      .then(setBook)
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i) => i._id === book._id);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push({ _id: book._id, title: book.title, price: book.price, image: book.image, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  };

  if (loading) return <div className="page container"><p>Đang tải...</p></div>;
  if (!book) return <div className="page container"><p>Không tìm thấy sách.</p></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--green-100)', borderRadius: 12, height: 400, overflow: 'hidden' }}>
            {book.image ? <img src={book.image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{book.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{book.categoryId?.name}</p>
            <p style={{ fontSize: '1.5rem', color: 'var(--green-700)', fontWeight: 700, marginBottom: '1rem' }}>
              {Number(book.price).toLocaleString('vi-VN')} ₫
            </p>
            <p style={{ marginBottom: '1rem' }}>{book.description || 'Chưa có mô tả.'}</p>
            <button type="button" onClick={addToCart} style={{ background: 'var(--green-600)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 600 }}>
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
