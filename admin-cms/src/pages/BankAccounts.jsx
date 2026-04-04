import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX, FiUpload, FiCreditCard, FiCheck } from 'react-icons/fi';
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

function BankModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial);
  const empty = { bankName: '', accountNumber: '', accountHolder: '', qrImage: '' };
  const [form, setForm] = useState(
    isEdit
      ? {
          bankName: initial.bankName || '',
          accountNumber: initial.accountNumber || '',
          accountHolder: initial.accountHolder || '',
          qrImage: initial.qrImage || '',
        }
      : empty,
  );
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const objUrlRef = { current: '' };

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
      if (url) setField('qrImage', url);
      else setError('Upload thất bại.');
    } catch {
      setError('Upload thất bại.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleUrlChange = (v) => {
    setField('qrImage', v);
    if (objUrlRef.current) { URL.revokeObjectURL(objUrlRef.current); objUrlRef.current = ''; }
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bankName.trim()) { setError('Vui lòng nhập tên ngân hàng.'); return; }
    if (!form.accountNumber.trim()) { setError('Vui lòng nhập số tài khoản.'); return; }
    if (!form.accountHolder.trim()) { setError('Vui lòng nhập tên chủ tài khoản.'); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/api/bank-accounts/${initial._id}`, form);
      else await api.post('/api/bank-accounts', form);
      onSaved();
    } catch (err) {
      if (!err?.silentAuthRedirect) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const displaySrc = preview || form.qrImage;

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
            {isEdit ? 'Sửa tài khoản ngân hàng' : 'Thêm tài khoản ngân hàng'}
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
            Ngân hàng <span className="text-red-500">*</span>
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => setField('bankName', e.target.value)}
              className={BASE_INPUT}
              placeholder="VD: Vietcombank, MB Bank,..."
              autoFocus
            />
          </label>

          <label className={LABEL}>
            Số tài khoản <span className="text-red-500">*</span>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setField('accountNumber', e.target.value)}
              className={BASE_INPUT}
              placeholder="0123456789"
            />
          </label>

          <label className={LABEL}>
            Tên chủ tài khoản <span className="text-red-500">*</span>
            <input
              type="text"
              value={form.accountHolder}
              onChange={(e) => setField('accountHolder', e.target.value)}
              className={BASE_INPUT}
              placeholder="NGUYEN VAN A"
            />
          </label>

          {/* QR */}
          <div>
            <p className={LABEL}>Ảnh mã QR</p>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition">
                <FiUpload className="h-4 w-4" />
                {uploading ? 'Đang upload...' : 'Upload QR'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={form.qrImage}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={BASE_INPUT + ' mt-2'}
              placeholder="Hoặc dán URL ảnh QR..."
            />
            {displaySrc && (
              <div className="mt-2">
                <img
                  src={resolveImgSrc(displaySrc)}
                  alt="QR Preview"
                  className="h-44 w-auto max-w-[200px] object-contain rounded-xl border border-slate-200 bg-white shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

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
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BankAccounts() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    api.get('/api/bank-accounts')
      .then((d) => setList(Array.isArray(d) ? d : d.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    api.get('/api/bank-accounts')
      .then((d) => setList(Array.isArray(d) ? d : d.data || []));
  };

  const handleDelete = async (b) => {
    if (!confirm(`Xóa tài khoản "${b.bankName}"?`)) return;
    try {
      await api.delete(`/api/bank-accounts/${b._id}`);
      setList((prev) => prev.filter((x) => x._id !== b._id));
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

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
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tài khoản ngân hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? '...' : `${list.length} tài khoản — dùng cho chuyển khoản & thanh toán COD`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="h-4 w-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center">
          <FiCreditCard className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-700">Chưa có tài khoản ngân hàng</p>
          <p className="mt-1 text-sm text-slate-500">
            Nhấn{' '}
            <button
              type="button"
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
            >
              Thêm tài khoản
            </button>{' '}để tạo mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((b, index) => {
            const imgSrc = resolveImgSrc(b.qrImage);
            return (
              <div
                key={b._id}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                {/* Index badge */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconBtn
                      onClick={() => { setEditTarget(b); setModalOpen(true); }}
                      title="Sửa"
                    >
                      <FiPlus className="h-3.5 w-3.5 -rotate-45" />
                    </IconBtn>
                    <IconBtn
                      onClick={() => handleDelete(b)}
                      title="Xóa"
                      variant="danger"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </div>

                {/* Bank name */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                    <FiCreditCard className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {b.bankName}
                  </h3>
                </div>

                {/* Account number */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 mb-3">
                  <p className="text-xs text-slate-500">Số tài khoản</p>
                  <p className="text-sm font-semibold font-mono tracking-wider text-slate-900">
                    {b.accountNumber}
                  </p>
                </div>

                {/* Holder */}
                <div className="flex items-center gap-2 mb-4">
                  <FiCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <p className="text-xs text-slate-600 truncate" title={b.accountHolder}>
                    {b.accountHolder}
                  </p>
                </div>

                {/* QR preview */}
                {imgSrc ? (
                  <div className="relative mt-auto overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={imgSrc}
                      alt="QR Code"
                      className="mx-auto h-28 w-auto object-contain p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shadow backdrop-blur-sm">
                      Mã QR
                    </span>
                  </div>
                ) : (
                  <div className="mt-auto flex h-16 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60">
                    <p className="text-xs text-slate-400">Chưa có ảnh QR</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <BankModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={() => { setModalOpen(false); setEditTarget(null); reload(); }}
        />
      )}
    </div>
  );
}
