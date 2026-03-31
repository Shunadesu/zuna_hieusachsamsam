import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryStore } from '../store/useCategoryStore';
import { useBookStore } from '../store/useBookStore';
import api, { requestUpload } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';

const inputCls =
  'mt-1 px-3 py-2.5 rounded-lg border border-gray-300 w-full text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:border-gray-400';
const labelCls = 'block text-sm font-medium text-gray-700';

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
    isHot: false,
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
          isHot: !!book.isHot,
          images: imgs,
        });
      })
      .catch((err) => {
        if (!cancelled && !err?.silentAuthRedirect) alert(err.message);
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
  const resolveImageSrc = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  const handleUploadFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const data = await requestUpload('/api/books/upload', formData);
      const urls = Array.isArray(data.urls) ? data.urls : [];
      if (urls.length) {
        setImages((arr) => [...arr.filter((u) => u.trim() !== ''), ...urls]);
      }
      e.target.value = '';
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
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
      isHot: !!form.isHot,
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
      if (!err?.silentAuthRedirect) alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadBook) {
    return <div className="text-gray-600 py-4">Đang tải...</div>;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => navigate('/books')}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          ← Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Chỉnh sửa sách' : 'Thêm sách'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col gap-7">
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <p className="text-sm text-gray-700">
            Điền thông tin cơ bản trước, sau đó thêm ảnh sách. Các trường có dấu <span className="text-red-500">*</span> là bắt buộc.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-800">Thông tin chính</h2>
            <label className={labelCls}>
              Tên sách <span className="text-red-500">*</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
                required
                placeholder="Nhập tên sách"
              />
            </label>

            <label className={labelCls}>
              Thể loại
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className={inputCls}
              >
                <option value="">— Chọn thể loại —</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className={labelCls}>
              Mô tả
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls + ' min-h-[135px]'}
                placeholder="Mô tả ngắn về sách, nội dung, tác giả..."
                rows={5}
              />
            </label>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-800">Giá và tồn kho</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={labelCls}>
                Giá bán (₫) <span className="text-red-500">*</span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={inputCls}
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
                  className={inputCls}
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
                className={inputCls + ' max-w-[180px]'}
                required
                placeholder="0"
              />
            </label>

            <label className="inline-flex items-center gap-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 w-fit">
              <input
                type="checkbox"
                checked={form.isHot}
                onChange={(e) => setForm((f) => ({ ...f, isHot: e.target.checked }))}
                className="h-4 w-4"
              />
              Đánh dấu sách hot
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-base font-semibold text-gray-800">Ảnh sách</span>
            <div className="flex gap-2">
              <label className="text-sm text-gray-700 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
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
                className="text-sm text-gray-700 hover:text-gray-900 border border-gray-300 px-3 py-2 rounded-lg"
              >
                + Thêm URL
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">Bạn có thể upload nhiều ảnh hoặc dán URL ảnh trực tiếp.</p>
          <div className="flex flex-col gap-3">
            {form.images.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => changeImage(index, e.target.value)}
                  className={inputCls}
                  placeholder="https://... hoặc /uploads/..."
                />
                <button
                  type="button"
                  onClick={() => removeImageRow(index)}
                  className="text-red-600 hover:text-red-700 text-sm shrink-0 px-2"
                  title="Xóa dòng ảnh"
                >
                  Xóa
                </button>
              </div>
            ))}
            {form.images.filter((u) => u.trim()).length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2 pt-1">
                {form.images.filter((u) => u.trim()).map((url, i) => (
                  <img
                    key={i}
                    src={resolveImageSrc(url)}
                    alt={`Ảnh sách ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-700 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 font-medium disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm sách'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
