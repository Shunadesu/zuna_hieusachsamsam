import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryStore } from '../store/useCategoryStore';
import { useBookStore } from '../store/useBookStore';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const inputCls = 'px-2 py-1.5 rounded border border-gray-300 w-full';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function AddBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { list: categories, fetchCategories } = useCategoryStore();
  const { invalidate } = useBookStore();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    quantity: '',
    categoryId: '',
    images: [''],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadBook, setLoadBook] = useState(!!id);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api.get(`/api/books/${id}`)
      .then((book) => {
        if (cancelled) return;
        const imgs = Array.isArray(book.images) && book.images.length > 0 ? [...book.images] : book.image ? [book.image] : [''];
        if (imgs.length === 0) imgs.push('');
        setForm({
          title: book.title || '',
          description: book.description || '',
          price: book.price ?? '',
          originalPrice: book.originalPrice ?? '',
          quantity: book.quantity ?? '',
          categoryId: book.categoryId?._id || book.categoryId || '',
          images: imgs,
        });
      })
      .catch((err) => {
        if (!cancelled) alert(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadBook(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const setImages = (updater) => {
    setForm((f) => ({ ...f, images: updater(f.images) }));
  };

  const addImageRow = () => setImages((arr) => [...arr, '']);
  const removeImageRow = (index) => setImages((arr) => arr.filter((_, i) => i !== index));
  const changeImage = (index, value) => setImages((arr) => arr.map((v, i) => (i === index ? value : v)));

  const handleUploadFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/books/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload thất bại');
      const urls = Array.isArray(data.urls) ? data.urls : [];
      if (urls.length) {
        setImages((arr) => [...arr.filter((u) => u.trim() !== ''), ...urls]);
      }
      e.target.value = '';
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const images = form.images.filter((url) => url.trim());
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      quantity: Number(form.quantity) || 0,
      categoryId: form.categoryId || null,
      images: images.length > 0 ? images : undefined,
    };
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/books/${id}`, payload);
      } else {
        await api.post('/api/books', payload);
      }
      invalidate();
      navigate('/books');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadBook) {
    return <div className="text-gray-600 py-4">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => navigate('/books')}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          ← Quay lại
        </button>
        <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Chỉnh sửa sách' : 'Thêm sách'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <label className={labelCls}>
              Tên sách <span className="text-red-500">*</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls + ' mt-1'}
                required
                placeholder="Nhập tên sách"
              />
            </label>

            <label className={labelCls}>
              Thể loại
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className={inputCls + ' mt-1'}
              >
                <option value="">— Chọn thể loại —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className={labelCls}>
                Giá bán (₫) <span className="text-red-500">*</span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={inputCls + ' mt-1'}
                  required
                  placeholder="0"
                />
              </label>
              <label className={labelCls}>
                Giá gốc (₫)
                <input
                  type="number"
                  min={0}
                  value={form.originalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                  className={inputCls + ' mt-1'}
                  placeholder="0"
                />
              </label>
            </div>

            <label className={labelCls}>
              Số lượng <span className="text-red-500">*</span>
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className={inputCls + ' mt-1 max-w-[140px]'}
                required
                placeholder="0"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4">
            <label className={labelCls}>
              Mô tả
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls + ' mt-1 min-h-[120px]'}
                placeholder="Mô tả ngắn"
                rows={4}
              />
            </label>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={labelCls}>Ảnh sách</span>
                <div className="flex gap-2">
                  <label className="text-xs text-gray-700 border border-gray-300 px-2 py-1 rounded cursor-pointer hover:bg-gray-50">
                    {uploading ? 'Đang upload...' : 'Upload ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadFiles}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addImageRow}
                    className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 px-2 py-1 rounded"
                  >
                    + Thêm URL
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {form.images.map((url, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => changeImage(index, e.target.value)}
                      className={inputCls + ' text-sm'}
                      placeholder="https://... hoặc /uploads/..."
                    />
                    <button
                      type="button"
                      onClick={() => removeImageRow(index)}
                      className="text-red-600 hover:text-red-700 text-xs shrink-0"
                      title="Xóa dòng ảnh"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                {form.images.filter((u) => u.trim()).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.images.filter((u) => u.trim()).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-14 h-14 object-cover rounded border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm sách'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
