import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    api.get('/api/auth/me').then(setUser).catch(() => setUser(null));
  }, []);

  if (!user) return <div className="page container"><p>Đang tải...</p></div>;
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 400 }}>
        <h1 style={{ marginBottom: '1rem' }}>Tài khoản</h1>
        <p><strong>Họ tên:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.address && <p><strong>Địa chỉ:</strong> {user.address}</p>}
      </div>
    </div>
  );
}
