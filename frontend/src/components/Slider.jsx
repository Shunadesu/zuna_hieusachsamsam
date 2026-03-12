import { useState, useEffect } from 'react';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Slider() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    api.get('/api/sliders').then(setSlides).catch(() => setSlides([]));
  }, []);

  if (slides.length === 0) return null;

  return (
    <section style={{ marginBottom: '1.5rem', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px var(--shadow)' }}>
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
        {slides.map((s) => (
          <a key={s._id} href={s.link || '#'} style={{ flex: '0 0 100%', scrollSnapAlign: 'start' }}>
            <img
              src={s.image?.startsWith('http') ? s.image : API_URL + (s.image || '')}
              alt=""
              style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }}
            />
          </a>
        ))}
      </div>
    </section>
  );
}
