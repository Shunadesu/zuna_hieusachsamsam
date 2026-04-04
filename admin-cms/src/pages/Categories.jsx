import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiUpload, FiX,
  FiChevronUp, FiChevronDown, FiImage, FiLayers,
} from 'react-icons/fi';
import { useCategoryStore } from '../store/useCategoryStore';
import api, { requestUpload } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';

const BASE_INPUT =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition';

const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

function resolveImageSrc(value) {
  if (!value) return '';
  return value.startsWith('http') || value.startsWith('blob:') ? value : API_URL + value;
}

async function uploadImage(fd) {
  const data = await requestUpload('/api/books/upload', fd);
  return Array.isArray(data?.urls) ? data.urls[0] || '' : '';
}

function CategoryModal({ mode, initial, onClose, onSaved }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    name: initial?.name || '',
    image: initial?.image || '',
    order: initial?.order ?? 0,
  });
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const objectUrlRef = useRef('');

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError('');
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setPreview(objectUrlRef.current);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const url = await uploadImage(fd);
      if (url) setField('image', url);
      else setError('Upload thất bại, vui lòng thử lại.');
    } catch {
      setError('Upload thất bại, vui lòng thử lại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleUrlChange = (v) => {
    setField('image', v);
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = ''; }
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Vui lòng nhập tên thể loại.'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), image: form.image, order: Number(form.order) || 0 };
      if (isEdit) await api.put(`/api/categories/${initial._id}`, payload);
      else await api.post('/api/categories', payload);
      onSaved();
    } catch (err) {
      if (!err?.silentAuthRedirect) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const displaySrc = preview || form.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Sửa thể loại' : 'Thêm thể loại mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <label className={LABEL}>
            Tên thể loại <span className="text-red-500">*</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className={BASE_INPUT}
              placeholder="VD: Tiểu thuyết, Kinh tế,..."
              autoFocus
            />
          </label>

          <div>
            <p className={LABEL}>Ảnh thể loại</p>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition">
                <FiUpload className="h-4 w-4" />
                {uploading ? 'Đang upload...' : 'Upload ảnh'}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleFile}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={form.image}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={BASE_INPUT + ' mt-2'}
              placeholder="Hoặc dán URL ảnh..."
            />
            {displaySrc && (
              <div className="mt-2">
                <img
                  src={resolveImageSrc(displaySrc)}
                  alt="Xem trước"
                  className="h-32 w-full max-w-[200px] object-cover rounded-xl border border-slate-200 shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <label className={LABEL}>
            Thứ tự hiển thị
            <input
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setField('order', e.target.value)}
              className={BASE_INPUT + ' max-w-[120px]'}
              placeholder="0"
            />
            <p className="mt-1 text-xs text-slate-400">Số nhỏ hơn sẽ hiển thị trước</p>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm thể loại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const { list, fetchCategories, invalidate } = useCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const sorted = useMemo(
    () => [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name)),
    [list],
  );

  const reload = () => { invalidate(); fetchCategories(); };

  const handleDelete = async (c) => {
    if (!confirm(`Xóa thể loại "${c.name}"?`)) return;
    try {
      await api.delete(`/api/categories/${c._id}`);
      reload();
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const moveCategory = async (id, direction) => {
    const idx = sorted.findIndex((c) => c._id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const current = sorted[idx];
    const target = sorted[targetIdx];
    const curOrder = current.order ?? idx;
    const tgtOrder = target.order ?? targetIdx;
    try {
      await Promise.all([
        api.put(`/api/categories/${current._id}`, { order: tgtOrder }),
        api.put(`/api/categories/${target._id}`, { order: curOrder }),
      ]);
      reload();
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const IconBtn = ({ onClick, title, children, variant = 'default' }) => {
    const variants = {
      default: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
      danger: 'border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition ${variants[variant] || variants.default}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Thể loại
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {sorted.length} thể loại — dùng ↑↓ để sắp xếp thứ tự hiển thị
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="h-4 w-4" />
          Thêm thể loại
        </button>
      </div>

      {/* Card grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center">
          <FiLayers className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-700">Chưa có thể loại nào</p>
          <p className="mt-1 text-sm text-slate-500">
            Nhấn{' '}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
            >
              Thêm thể loại
            </button>
            {' '}để tạo mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((c, index) => {
            const imgSrc = resolveImageSrc(c.image);
            return (
              <div
                key={c._id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={c.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FiImage className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white backdrop-blur-sm">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1" title={c.name}>
                    {c.name}
                  </h3>

                  {/* Reorder */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 shrink-0">Thứ tự:</span>
                    <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => moveCategory(c._id, 'up')}
                        disabled={index === 0}
                        className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Lên trên"
                      >
                        <FiChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="h-7 min-w-8 flex items-center justify-center border-x border-slate-200 text-xs font-medium text-slate-700 tabular-nums">
                        {c.order ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveCategory(c._id, 'down')}
                        disabled={index === sorted.length - 1}
                        className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Xuống dưới"
                      >
                        <FiChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-1.5 pt-3">
                    <IconBtn
                      onClick={() => { setEditTarget(c); setEditModalOpen(true); }}
                      title="Sửa"
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn onClick={() => handleDelete(c)} title="Xóa" variant="danger">
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                    <span className="ml-auto text-xs text-slate-400 tabular-nums">
                      #{String(c._id).slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {modalOpen && (
        <CategoryModal
          mode="add"
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); reload(); }}
        />
      )}

      {/* Edit modal */}
      {editModalOpen && editTarget && (
        <CategoryModal
          mode="edit"
          initial={editTarget}
          onClose={() => { setEditModalOpen(false); setEditTarget(null); }}
          onSaved={() => { setEditModalOpen(false); setEditTarget(null); reload(); }}
        />
      )}
    </div>
  );
}
