import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUpload,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiImage,
} from 'react-icons/fi';
import { useCategoryStore } from '../store/useCategoryStore';
import { useBookStore } from '../store/useBookStore';
import api, { requestUpload } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';

const BASE_INPUT =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition';

const inputBase = BASE_INPUT + ' max-w-none';

const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

const SECTION =
  'rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 flex flex-col gap-4';

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
    quantityType: 'book',
    categoryId: '',
    status: 'available',
    isHot: false,
    images: [''],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadBook, setLoadBook] = useState(!!id);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api.get(`/api/books/${id}`)
      .then((book) => {
        if (cancelled) return;
        const imgs =
          Array.isArray(book.images) && book.images.length > 0
            ? [...book.images]
            : book.image
              ? [book.image]
              : [''];
        if (imgs.length === 0) imgs.push('');
        setForm({
          title: book.title || '',
          description: book.description || '',
          price: book.price ?? '',
          originalPrice: book.originalPrice ?? '',
          quantity: book.quantity ?? '',
          quantityType: book.quantityType || 'book',
          categoryId: book.categoryId?._id || book.categoryId || '',
          status: book.status || 'available',
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
    return () => {
      cancelled = true;
    };
  }, [id]);

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setImages = (updater) => {
    setForm((f) => ({ ...f, images: updater(f.images) }));
  };

  const addImageRow = () => setImages((arr) => [...arr, '']);
  const removeImageRow = (index) =>
    setImages((arr) => arr.filter((_, i) => i !== index));
  const changeImage = (index, value) =>
    setImages((arr) => arr.map((v, i) => (i === index ? value : v)));
  const imgSrc = (url) =>
    url.startsWith('http') ? url : API_URL + url;

  const validImages = form.images.filter((u) => u.trim());

  const handleUploadFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const data = await requestUpload('/api/books/upload', formData);
      const urls = Array.isArray(data.urls) ? data.urls : [];
      if (urls.length) {
        setImages((arr) => [
          ...arr.filter((u) => u.trim() !== ''),
          ...urls,
        ]);
      }
      e.target.value = '';
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Vui lòng nhập tên sách';
    if (!form.price || Number(form.price) < 0) errs.price = 'Giá bán phải ≥ 0';
    if (form.originalPrice && Number(form.originalPrice) < 0)
      errs.originalPrice = 'Giá gốc phải ≥ 0';
    if (!form.quantity || Number(form.quantity) < 0)
      errs.quantity = 'Số lượng phải ≥ 0';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const first = document.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    const images = form.images.filter((url) => url.trim());
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice:
        form.originalPrice !== '' ? Number(form.originalPrice) : undefined,
      quantity: Number(form.quantity) || 0,
      quantityType: form.quantityType,
      categoryId: form.categoryId || null,
      status: form.status,
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
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 mr-2 align-middle" />
        Đang tải dữ liệu sách...
      </div>
    );
  }

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
        <FiX className="h-3 w-3 shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="max-w-[900px]">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/books')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <FiArrowLeft className="h-4 w-4" />
          Danh sách sách
        </button>
        <span className="text-slate-300 select-none">/</span>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {isEdit ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">
          {/* ── Thông tin chính ───────────────────────────── */}
          <section className={SECTION}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                Thông tin chính
              </h2>
              <span className="text-xs text-red-600">* Bắt buộc</span>
            </div>

            <label className={LABEL}>
              Tên sách <span className="text-red-500">*</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className={inputBase}
                aria-invalid={!!errors.title}
                required
                placeholder="Nhập tên sách"
              />
              <FieldError field="title" />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={LABEL}>
                Thể loại
                <select
                  value={form.categoryId}
                  onChange={(e) => setField('categoryId', e.target.value)}
                  className={inputBase}
                >
                  <option value="">— Chọn thể loại —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={LABEL}>
                Trạng thái tồn kho
                <select
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  className={inputBase}
                >
                  <option value="available">Còn hàng</option>
                  <option value="out_of_stock">Hết hàng</option>
                  <option value="sold">Đã bán</option>
                </select>
              </label>
            </div>

            <label className={LABEL}>
              Mô tả
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className={inputBase + ' min-h-[120px] resize-y'}
                placeholder="Mô tả ngắn về sách, nội dung, tác giả,..."
                rows={5}
              />
            </label>
          </section>

          {/* ── Giá và tồn kho ────────────────────────────── */}
          <section className={SECTION}>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Giá và tồn kho
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={LABEL}>
                Giá bán (₫) <span className="text-red-500">*</span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  className={inputBase}
                  aria-invalid={!!errors.price}
                  required
                  placeholder="0"
                />
                <FieldError field="price" />
              </label>

              <label className={LABEL}>
                Giá gốc (₫)
                <input
                  type="number"
                  min={0}
                  value={form.originalPrice}
                  onChange={(e) =>
                    setField('originalPrice', e.target.value)
                  }
                  className={inputBase}
                  aria-invalid={!!errors.originalPrice}
                  placeholder="Để trống nếu không có"
                />
                <FieldError field="originalPrice" />
              </label>
            </div>

            {/* Số lượng + loại */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className={LABEL}>
                Số lượng <span className="text-red-500">*</span>
                <input
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => setField('quantity', e.target.value)}
                  className={inputBase}
                  aria-invalid={!!errors.quantity}
                  required
                  placeholder="0"
                />
                <FieldError field="quantity" />
              </label>

              <label className={LABEL}>
                Đơn vị tính
                <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setField('quantityType', 'book')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition ${
                      form.quantityType === 'book'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Cuốn
                  </button>
                  <button
                    type="button"
                    onClick={() => setField('quantityType', 'set')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition ${
                      form.quantityType === 'set'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Bộ
                  </button>
                </div>
              </label>

              <div className="flex items-end">
                <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isHot}
                    onChange={(e) => setField('isHot', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  Đánh dấu Hot
                </label>
              </div>
            </div>
          </section>

          {/* ── Ảnh sách ──────────────────────────────────── */}
          <section className={SECTION}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                Ảnh sách
              </h2>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm cursor-pointer transition hover:bg-slate-50">
                  <FiUpload className="h-4 w-4" />
                  {uploading ? 'Đang upload...' : 'Upload ảnh'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadFiles}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={addImageRow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                >
                  <FiPlus className="h-4 w-4" />
                  Thêm URL
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Upload ảnh hoặc dán URL trực tiếp. Ảnh đầu tiên sẽ là ảnh bìa
              chính.
            </p>

            {/* URL rows */}
            <div className="flex flex-col gap-2">
              {form.images.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => changeImage(index, e.target.value)}
                    className={BASE_INPUT + ' flex-1'}
                    placeholder="https://... hoặc /uploads/..."
                  />
                  <button
                    type="button"
                    onClick={() => removeImageRow(index)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-30"
                    disabled={form.images.length <= 1}
                    title="Xóa dòng"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Preview */}
            {validImages.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Xem trước
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {validImages.map((url, i) => (
                    <div
                      key={i}
                      className={`group relative aspect-[3/4] overflow-hidden rounded-xl border shadow-sm transition ${
                        i === 0
                          ? 'border-slate-400 ring-2 ring-slate-900'
                          : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={imgSrc(url)}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Bìa
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Hành động ─────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FiCheck className="h-4 w-4" />
                  {isEdit ? 'Cập nhật sách' : 'Thêm sách'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
