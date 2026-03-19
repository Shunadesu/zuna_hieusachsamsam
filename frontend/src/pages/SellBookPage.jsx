import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Seo from '../components/Seo';

export default function SellBookPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    bookTitle: '',
    author: '',
    condition: '',
    desiredPrice: '',
    description: '',
    imageLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true, state: { openLogin: true } });
      return;
    }
    setForm((f) => ({ ...f, name: user.name || '', email: user.email || '' }));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.phone?.trim() || !form.address?.trim()) {
      setError('Vui lòng nhập số điện thoại và địa chỉ.');
      return;
    }
    const bookInfoParts = [
      form.bookTitle && `Tên sách: ${form.bookTitle}`,
      form.author && `Tác giả: ${form.author}`,
      form.condition && `Tình trạng: ${form.condition}`,
      form.desiredPrice && `Giá mong muốn: ${form.desiredPrice}`,
      form.description && `Mô tả: ${form.description}`,
    ].filter(Boolean);
    const bookInfo = bookInfoParts.join('\n') || 'Không ghi rõ';
    const noteParts = [
      form.name && `Tên: ${form.name}`,
      form.email && `Email: ${form.email}`,
      form.imageLink && `Link ảnh: ${form.imageLink}`,
    ].filter(Boolean);
    const note = noteParts.join(' | ') || '';

    setLoading(true);
    try {
      await api.post('/api/sell-requests', {
        bookInfo,
        phone: form.phone.trim(),
        address: form.address.trim(),
        note,
      });
      setSuccess(true);
      setForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        bookTitle: '',
        author: '',
        condition: '',
        desiredPrice: '',
        description: '',
        imageLink: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi yêu cầu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (success) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-lg text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Đã gửi yêu cầu</h1>
        <p className="text-gray-600 mb-6">
          Cửa hàng sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-green-800 font-medium hover:underline"
        >
          Gửi thêm yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Seo
        title="Bán sách cho cửa hàng"
        description="Gửi thông tin thanh lý sách nhanh chóng tại Sách Truyện Mỹ Hạnh. Cửa hàng sẽ liên hệ thẩm định và báo giá sớm."
      />
      <h1 className="text-2xl font-bold text-green-800 mb-6">Bán sách cho cửa hàng</h1>
      <p className="text-gray-600 text-sm mb-6">
        Điền form bên dưới. Nếu có ảnh sách, bạn có thể dán link ảnh vào ô "Link ảnh sách".
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-green-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-green-200 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-green-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Địa chỉ liên hệ / nhận sách"
            className="w-full rounded-lg border border-green-200 px-3 py-2"
          />
        </div>
        <div className="border-t border-green-200 pt-4 mt-6">
          <h2 className="font-bold text-green-900 mb-3">Thông tin sách</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách</label>
              <input
                type="text"
                name="bookTitle"
                value={form.bookTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng sách</label>
              <input
                type="text"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                placeholder="Ví dụ: Mới, 95%..."
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá mong muốn (VNĐ)</label>
              <input
                type="text"
                name="desiredPrice"
                value={form.desiredPrice}
                onChange={handleChange}
                placeholder="Ví dụ: 50000"
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-green-200 px-3 py-2"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh sách (nếu có)</label>
            <input
              type="url"
              name="imageLink"
              value={form.imageLink}
              onChange={handleChange}
              placeholder="Dán link ảnh sách"
              className="w-full rounded-lg border border-green-200 px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu bán sách'}
        </button>
      </form>
    </div>
  );
}
