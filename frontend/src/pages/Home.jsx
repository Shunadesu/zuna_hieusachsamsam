import { Link } from 'react-router-dom';
import Slider from '../components/Slider';

export default function Home() {
  return (
    <div className="page">
      <div className="container">
        <Slider />
        <section style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--green-800)' }}>Chào mừng đến Hiệu sách</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sách hay - Giá tốt - Giao hàng tận nơi</p>
          <Link to="/books" style={btnStyle}>Xem sách</Link>
        </section>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {[1, 2, 3].map((i) => (
            <Link key={i} to="/books" style={cardStyle}>
              <div style={{ height: 180, background: 'var(--green-100)', borderRadius: 8 }} />
              <h3 style={{ marginTop: 8 }}>Danh mục {i}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Xem thêm</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

const btnStyle = { display: 'inline-block', background: 'var(--green-600)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 600 };
const cardStyle = { background: 'var(--bg-card)', padding: '1rem', borderRadius: 12, boxShadow: '0 2px 8px var(--shadow)' };
