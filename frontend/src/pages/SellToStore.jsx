import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SellToStore() {
  const [bookInfo, setBookInfo] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="page container">
        <p>Vui lòng <a href="/login">đăng nhập</a> để gửi yêu cầu bán sách.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/sell-requests', { bookInfo, phone, address, note });
      alert('Đã gửi yêu cầu. Chúng tôi sẽ liên hệ bạn.');
      navigate('/');
    } catch (err) {
      alert(err.message || 'Gửi thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        <h1 style={{ marginBottom: '1rem' }}>Bán sách cho hiệu sách</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea placeholder="Thông tin sách (tên, thể loại, tình trạng, giá mong muốn...)" value={bookInfo} onChange={(e) => setBookInfo(e.target.value)} required rows={4} style={inputStyle} />
          <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Địa chỉ" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
          <textarea placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={inputStyle} />
          <button type="submit" disabled={loading} style={{ background: 'var(--green-600)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 8 }}>{loading ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { padding: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' };
