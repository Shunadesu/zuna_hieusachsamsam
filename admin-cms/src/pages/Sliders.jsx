import { useState, useEffect, useRef } from 'react';
import {
  FiPlus, FiTrash2, FiX, FiUpload, FiLink, FiImage,
  FiChevronUp, FiChevronDown, FiExternalLink, FiLayout,
} from 'react-icons/fi';
import api, { requestUpload } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';

const BASE_INPUT =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition';

const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

function resolveImgSrc(v) {
  if (!v) return '';
  return v.startsWith('http') || v.startsWith('blob:') ? v : API_URL + v;
}

async function uploadImg(fd) {
  const data = await requestUpload('/api/books/upload', fd);
  return Array.isArray(data?.urls) ? data.urls[0] || '' : '';
}

function SliderModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial);
  const empty = { image: '', link: '', order: 0, isBanner: false };
  const [form, setForm] = useState(
    isEdit
      ? {
          image: initial.image || '',
          link: initial.link || '',
          order: initial.order ?? 0,
          isBanner: (initial.order ?? 0) >= 100,
        }
      : empty,
  );
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const objUrlRef = useRef('');

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError('');
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
    objUrlRef.current = URL.createObjectURL(file);
    setPreview(objUrlRef.current);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const url = await uploadImg(fd);
      if (url) setField('image', url);
      else setError('Upload thất bại.');
    } catch {
      setError('Upload thất bại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image.trim()) { setError('Vui lòng chọn hoặc nhập URL ảnh.'); return; }
    setSaving(true);
    try {
      const baseOrder = Number(form.order) || 0;
      const payload = {
        image: form.image,
        link: form.link,
        order: form.isBanner ? Math.max(100, baseOrder) : Math.min(99, baseOrder),
      };
      if (isEdit) await api.put(`/api/sliders/${initial._id}`, payload);
      else await api.post('/api/sliders', payload);
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
            {isEdit ? 'Sửa slide' : 'Thêm slide mới'}
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
          {/* Banner toggle */}
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isBanner}
              onChange={(e) => setField('isBanner', e.target.checked)}
              className="h-4 w-4 accent-slate-900"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">Banner dưới slider</p>
              <p className="text-xs text-slate-500">Hiển thị dưới slider chính, tự đặt order ≥ 100</p>
            </div>
          </label>

          {/* Image upload */}
          <div>
            <p className={LABEL}>Ảnh slide <span className="text-red-500">*</span></p>
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition">
              <FiUpload className="h-4 w-4" />
              {uploading ? 'Đang upload...' : 'Upload ảnh'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setField('image', e.target.value)}
              className={BASE_INPUT + ' mt-2'}
              placeholder="Hoặc dán URL ảnh..."
            />
            {displaySrc && (
              <div className="mt-2">
                <img
                  src={resolveImgSrc(displaySrc)}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Link */}
          <label className={LABEL}>
            Link liên kết
            <div className="relative">
              <FiLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.link}
                onChange={(e) => setField('link', e.target.value)}
                className={BASE_INPUT + ' pl-9'}
                placeholder="/sach, /ban-sach, hoặc https://..."
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Link nội bộ (VD: /sach) hoặc URL đầy đủ</p>
          </label>

          {/* Order */}
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
            <p className="mt-1 text-xs text-slate-400">
              Slider: order 0–99 · Banner: order ≥ 100
            </p>
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
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sliders() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    api.get('/api/sliders')
      .then((d) => setList(Array.isArray(d) ? d : d.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    api.get('/api/sliders')
      .then((d) => setList(Array.isArray(d) ? d : d.data || []));
  };

  const handleDelete = async (s) => {
    if (!confirm(`Xóa slide này?`)) return;
    try {
      await api.delete(`/api/sliders/${s._id}`);
      setList((prev) => prev.filter((x) => x._id !== s._id));
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const moveSlide = async (id, direction) => {
    const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((s) => s._id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const cur = sorted[idx], tgt = sorted[targetIdx];
    const curOrder = cur.order ?? idx, tgtOrder = tgt.order ?? targetIdx;
    try {
      await Promise.all([
        api.put(`/api/sliders/${cur._id}`, { order: tgtOrder }),
        api.put(`/api/sliders/${tgt._id}`, { order: curOrder }),
      ]);
      reload();
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const mainSlides = sorted.filter((s) => (s.order ?? 0) < 100);
  const banners = sorted.filter((s) => (s.order ?? 0) >= 100);

  const IconBtn = ({ onClick, children, title, variant = 'default' }) => {
    const variants = {
      default: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
      danger: 'border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition ${variants[variant]}`}
      >
        {children}
      </button>
    );
  };

  const SectionHeader = ({ icon: Icon, title, count }) => (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/10 text-slate-700">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {count != null && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600">
          {count}
        </span>
      )}
    </div>
  );

  const SliderCard = ({ s, index, total, isBanner }) => {
    const imgSrc = resolveImgSrc(s.image);
    return (
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md hover:border-slate-300">
        {/* Image */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FiImage className="h-10 w-10 text-slate-300" />
            </div>
          )}
          {/* Order badge */}
          <span className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white backdrop-blur-sm">
            {index + 1}
          </span>
          {s.link && (
            <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow text-slate-600">
              <FiExternalLink className="h-3 w-3" />
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs text-slate-500 truncate" title={s.link || 'Không có link'}>
            {s.link ? (
              <span className="flex items-center gap-1">
                <FiLink className="h-3 w-3 shrink-0" />
                {s.link}
              </span>
            ) : (
              <span className="italic">Không có liên kết</span>
            )}
          </p>

          {/* Reorder */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Order:</span>
            <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => moveSlide(s._id, 'up')}
                disabled={index === 0}
                className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <FiChevronUp className="h-3.5 w-3.5" />
              </button>
              <span className="h-7 min-w-8 flex items-center justify-center border-x border-slate-200 text-xs font-medium text-slate-700 tabular-nums">
                {s.order ?? 0}
              </span>
              <button
                type="button"
                onClick={() => moveSlide(s._id, 'down')}
                disabled={index === total - 1}
                className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <FiChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center gap-1.5 pt-3">
            <IconBtn
              onClick={() => { setEditTarget(s); setModalOpen(true); }}
              title="Sửa"
            >
              <FiPlus className="h-3.5 w-3.5 -rotate-45" />
            </IconBtn>
            <IconBtn
              onClick={() => handleDelete(s)}
              title="Xóa"
              variant="danger"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Slider & Banner</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? '...' : `${mainSlides.length} slide · ${banners.length} banner`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="h-4 w-4" />
          Thêm slide
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center">
          <FiLayout className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-700">Chưa có slide nào</p>
          <p className="mt-1 text-sm text-slate-500">
            Nhấn{' '}
            <button
              type="button"
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
            >
              Thêm slide
            </button>{' '}để tạo mới
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main sliders */}
          {mainSlides.length > 0 && (
            <section>
              <SectionHeader icon={FiLayout} title="Slider chính" count={mainSlides.length} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mainSlides.map((s, i) => (
                  <SliderCard key={s._id} s={s} index={i} total={mainSlides.length} />
                ))}
              </div>
            </section>
          )}

          {/* Banners */}
          {banners.length > 0 && (
            <section>
              <SectionHeader icon={FiImage} title="Banner dưới slider" count={banners.length} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {banners.map((s, i) => (
                  <SliderCard key={s._id} s={s} index={i} total={banners.length} isBanner />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <SliderModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={() => { setModalOpen(false); setEditTarget(null); reload(); }}
        />
      )}
    </div>
  );
}
