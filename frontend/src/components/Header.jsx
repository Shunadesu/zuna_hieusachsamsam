import { Link } from 'react-router-dom';

export default function Header() {
  const token = localStorage.getItem('token');
  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>Hiệu sách</Link>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Trang chủ</Link>
          <Link to="/books" style={styles.navLink}>Sách</Link>
          <Link to="/cart" style={styles.navLink}>Giỏ hàng</Link>
          {token ? (
            <>
              <Link to="/orders" style={styles.navLink}>Đơn hàng</Link>
              <Link to="/sell" style={styles.navLink}>Bán sách</Link>
              <Link to="/profile" style={styles.navLink}>Tài khoản</Link>
              <button type="button" onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} style={styles.btn}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>Đăng nhập</Link>
              <Link to="/register" style={styles.btn}>Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: { background: 'var(--green-100)', borderBottom: '1px solid var(--border)', padding: '0.75rem 0' },
  inner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--green-800)' },
  nav: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  navLink: { color: 'var(--green-800)', fontWeight: 500 },
  btn: { background: 'var(--green-600)', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: 6 },
};
