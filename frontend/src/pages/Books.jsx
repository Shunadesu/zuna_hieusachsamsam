import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [booksRes, catsRes] = await Promise.all([
          api.get(`/api/books?search=${encodeURIComponent(search)}&categoryId=${categoryId || ''}&limit=24`),
          api.get('/api/categories'),
        ]);
        setBooks(booksRes.data || []);
        setCategories(catsRes || []);
      } catch (e) {
        setBooks([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, categoryId]);

  if (loading) return <div className="page container"><p>Đang tải...</p></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Sách</h1>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Tìm sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)', minWidth: 200 }}
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)' }}
          >
            <option value="">Tất cả thể loại</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {books.length === 0 && <p>Chưa có sách nào.</p>}
          {books.map((b) => (
            <Link key={b._id} to={`/books/${b.slug}`} style={cardStyle}>
              <div style={{ height: 220, background: 'var(--green-100)', borderRadius: 8, overflow: 'hidden' }}>
                {b.image ? <img src={b.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <h3 style={{ marginTop: 8, fontSize: '1rem' }}>{b.title}</h3>
              <p style={{ color: 'var(--green-700)', fontWeight: 600 }}>{Number(b.price).toLocaleString('vi-VN')} ₫</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: 'var(--bg-card)', padding: '1rem', borderRadius: 12, boxShadow: '0 2px 8px var(--shadow)' };
