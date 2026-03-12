import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Footer() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    api.get('/api/site/config').then(setConfig).catch(() => {});
  }, []);

  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div>
          <strong>Hiệu sách</strong>
          <p style={styles.muted}>Sách hay - Giá tốt</p>
        </div>
        <div style={styles.links}>
          <Link to="/books">Sách</Link>
          <Link to="/contact">Liên hệ</Link>
          {config?.facebookUrl && <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer">Facebook</a>}
          {config?.instagramUrl && <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {config?.tiktokUrl && <a href={config.tiktokUrl} target="_blank" rel="noopener noreferrer">TikTok</a>}
          {config?.googleMapsUrl && <a href={config.googleMapsUrl} target="_blank" rel="noopener noreferrer">Google Maps</a>}
        </div>
      </div>
      <div style={styles.copyright}>© {new Date().getFullYear()} Hiệu sách. All rights reserved.</div>
    </footer>
  );
}

const styles = {
  footer: { background: 'var(--green-200)', borderTop: '1px solid var(--border)', marginTop: 'auto' },
  inner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1rem', flexWrap: 'wrap', gap: '1rem' },
  muted: { color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 },
  links: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  copyright: { textAlign: 'center', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' },
};
