import { useState, useEffect } from 'react';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';
const inputCls = 'px-2 py-1.5 rounded border border-gray-300 text-sm';

export default function Sliders() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ image: '', link: '', order: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [belowSlider, setBelowSlider] = useState(false);

  useEffect(() => {
    api.get('/api/sliders').then(setList).catch(() => setList([]));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const normalizedOrder = Number(form.order) || 0;
      await api.post('/api/sliders', {
        ...form,
        order: belowSlider ? Math.max(100, normalizedOrder) : normalizedOrder,
      });
      const data = await api.get('/api/sliders');
      setList(data);
      setForm({ image: '', link: '', order: 0 });
      setBelowSlider(false);
      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/books/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || res.statusText);
      const url = data?.urls?.[0];
      if (url) {
        setForm((f) => ({ ...f, image: url }));
      } else {
        alert('Không nhận được URL ảnh từ server.');
      }
    } catch (err) {
      alert(err.message || 'Upload ảnh thất bại.');
    } finally {
      setUploading(false);
      // cho phép chọn lại cùng file nếu cần
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa slide này?')) return;
    try {
      await api.delete(`/api/sliders/${id}`);
      setList((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const sorted = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Slider</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 text-sm font-medium"
        >
          Thêm slide
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto mb-4">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gray-700 text-white text-xs">
              <th className="px-3 py-2 text-left font-medium w-10">Thứ tự</th>
              <th className="px-3 py-2 text-left font-medium w-40">Ảnh</th>
              <th className="px-3 py-2 text-left font-medium">Link</th>
              <th className="px-3 py-2 text-left font-medium w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50 text-sm">
                <td className="px-3 py-2 text-gray-700">{s.order ?? 0}</td>
                <td className="px-3 py-2">
                  <img
                    src={s.image && s.image.startsWith('http') ? s.image : API_URL + (s.image || '')}
                    alt=""
                    className="w-32 h-16 object-cover rounded border border-gray-200"
                  />
                </td>
                <td className="px-3 py-2 text-xs text-gray-700 break-all">{s.link || '-'}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(s._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-500 text-sm">
                  Chưa có slide. Nhấn &quot;Thêm slide&quot; để tạo mới.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">Thêm slide</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={belowSlider}
                  onChange={(e) => setBelowSlider(e.target.checked)}
                />
                Hiển thị dưới slider (banner)
                <span className="text-xs text-gray-500">
                  (tự đặt order ≥ 100)
                </span>
              </label>
              <div className="text-sm font-medium text-gray-700">
                Upload ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                  disabled={uploading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ảnh sẽ được lưu vào thư mục uploads và tự động điền URL bên dưới.
                </p>
              </div>
              <label className="text-sm font-medium text-gray-700">
                URL ảnh <span className="text-red-500">*</span>
                <input
                  placeholder="https://... hoặc /uploads/..."
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  required
                  className={inputCls + ' mt-1'}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Link
                <input
                  placeholder="Ví dụ: /sach hoặc /ban-sach (link nội bộ) hoặc https://..."
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  className={inputCls + ' mt-1'}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Thứ tự hiển thị
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  className={inputCls + ' mt-1 max-w-[120px]'}
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 text-sm font-medium"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
