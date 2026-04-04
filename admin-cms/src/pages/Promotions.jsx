import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiTrash2, FiX, FiPercent, FiTag, FiCalendar, FiClock } from 'react-icons/fi';
import api from '../services/api';

const BASE_INPUT =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition';

const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

const TYPE_OPTIONS = [
  { value: 'percent', label: 'Theo %' },
  { value: 'fixed', label: 'Theo số tiền' },
];

const fmtVND = (n) =>
  (Number(n) || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

function isActive(p) {
  const now = new Date();
  const start = p.startDate ? new Date(p.startDate) : null;
  const end = p.endDate ? new Date(p.endDate) : null;
  if (start && now < start) return 'upcoming';
  if (end && now > end) return 'expired';
  return 'active';
}

function PromotionModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial);
  const emptyForm = {
    name: '',
    type: 'percent',
    value: '',
    startDate: '',
    endDate: '',
  };
  const [form, setForm] = useState(isEdit
    ? {
        name: initial.name || '',
        type: initial.type || 'percent',
        value: initial.value ?? '',
        startDate: initial.startDate ? new Date(initial.startDate).toISOString().slice(0, 16) : '',
        endDate: initial.endDate ? new Date(initial.endDate).toISOString().slice(0, 16) : '',
      }
    : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Vui lòng nhập tên khuyến mãi.'); return; }
    if (!form.value || Number(form.value) < 0) { setError('Giá trị phải ≥ 0.'); return; }
    if (!form.startDate) { setError('Vui lòng chọn ngày bắt đầu.'); return; }
    if (!form.endDate) { setError('Vui lòng chọn ngày kết thúc.'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      };
      if (isEdit) await api.put(`/api/promotions/${initial._id}`, payload);
      else await api.post('/api/promotions', payload);
      onSaved();
    } catch (err) {
      if (!err?.silentAuthRedirect) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
            {isEdit ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
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
            Tên khuyến mãi <span className="text-red-500">*</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className={BASE_INPUT}
              placeholder="VD: Giảm 10% tháng 4"
              autoFocus
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className={LABEL}>
              Loại giảm giá
              <select
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                className={BASE_INPUT}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className={LABEL}>
              Giá trị <span className="text-red-500">*</span>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={form.type === 'percent' ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => setField('value', e.target.value)}
                  className={BASE_INPUT + ' pr-12'}
                  placeholder={form.type === 'percent' ? '10' : '50000'}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  {form.type === 'percent' ? '%' : '₫'}
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={LABEL}>
              Bắt đầu <span className="text-red-500">*</span>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
                className={BASE_INPUT}
              />
            </label>
            <label className={LABEL}>
              Kết thúc <span className="text-red-500">*</span>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
                className={BASE_INPUT}
              />
            </label>
          </div>

          {/* Preview */}
          {form.name && form.value && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">Xem trước</p>
              <p className="text-sm font-semibold text-slate-900">
                {form.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Giảm{' '}
                <span className="font-semibold text-rose-700">
                  {form.type === 'percent'
                    ? `${form.value}%`
                    : fmtVND(form.value)}
                </span>
              </p>
            </div>
          )}

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
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm khuyến mãi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Promotions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    api.get('/api/promotions')
      .then((d) => setList(Array.isArray(d) ? d : d.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    api.get('/api/promotions')
      .then((d) => setList(Array.isArray(d) ? d : d.data || []));
  };

  const handleDelete = async (p) => {
    if (!confirm(`Xóa khuyến mãi "${p.name}"?`)) return;
    try {
      await api.delete(`/api/promotions/${p._id}`);
      setList((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const sorted = useMemo(
    () => [...list].sort((a, b) => {
      const sa = isActive(a), sb = isActive(b);
      if (sa !== sb) {
        const order = { active: 0, upcoming: 1, expired: 2 };
        return order[sa] - order[sb];
      }
      return new Date(b.startDate) - new Date(a.startDate);
    }),
    [list],
  );

  const IconBtn = ({ onClick, variant = 'default', children, title }) => {
    const variants = {
      default: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
      danger: 'border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition ${variants[variant] || variants.default}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="max-w-[1000px]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Khuyến mãi</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? '...' : `${list.length} khuyến mãi — hiệu lực tự động theo ngày`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="h-4 w-4" />
          Thêm khuyến mãi
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center">
          <FiTag className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-700">Chưa có khuyến mãi nào</p>
          <p className="mt-1 text-sm text-slate-500">
            Nhấn{' '}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
            >
              Thêm khuyến mãi
            </button>{' '}để tạo mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((p) => {
            const active = isActive(p);
            const statusConfig = {
              active: { label: 'Đang hoạt động', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
              upcoming: { label: 'Sắp diễn ra', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', dot: 'bg-blue-500' },
              expired: { label: 'Đã hết hạn', bg: 'bg-slate-100', text: 'text-slate-500', ring: 'ring-slate-200', dot: 'bg-slate-400' },
            };
            const sc = statusConfig[active];
            return (
              <div
                key={p._id}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate" title={p.name}>
                        {p.name}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <IconBtn
                      onClick={() => { setEditTarget(p); setModalOpen(true); }}
                      title="Sửa"
                    >
                      <FiPlus className="h-3.5 w-3.5 -rotate-45" />
                    </IconBtn>
                    <IconBtn
                      onClick={() => handleDelete(p)}
                      title="Xóa"
                      variant="danger"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>

                {/* Value */}
                <div className="mt-4 flex items-end gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-rose-50 px-3 py-1 text-base font-bold text-rose-700 ring-1 ring-rose-200">
                      {p.type === 'percent'
                        ? `-${p.value}%`
                        : `-${fmtVND(p.value)}`}
                    </span>
                    <span className="text-xs text-slate-500 mb-1">
                      {p.type === 'percent' ? 'giảm giá' : 'giảm tiền'}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FiCalendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Bắt đầu: {fmtDateTime(p.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FiClock className="h-3.5 w-3.5 shrink-0" />
                    <span>Kết thúc: {fmtDateTime(p.endDate)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {(modalOpen) && (
        <PromotionModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={() => { setModalOpen(false); setEditTarget(null); reload(); }}
        />
      )}
    </div>
  );
}
