import { useState, useEffect, useMemo } from 'react';
import {
  FiPackage, FiPhone, FiMapPin, FiUser, FiCheckCircle,
  FiXCircle, FiEye, FiClock, FiCheck, FiX, FiBookOpen,
  FiMessageSquare, FiRefreshCw, FiChevronDown,
} from 'react-icons/fi';
import api from '../services/api';

const STATUS_OPTIONS = ['pending', 'viewed', 'contacted', 'rejected'];

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xử lý',
    bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200', dot: 'bg-amber-500',
    icon: FiClock,
  },
  viewed: {
    label: 'Đã xem',
    bg: 'bg-blue-50', text: 'text-blue-800', ring: 'ring-blue-200', dot: 'bg-blue-500',
    icon: FiEye,
  },
  contacted: {
    label: 'Đã liên hệ',
    bg: 'bg-emerald-50', text: 'text-emerald-800', ring: 'ring-emerald-200', dot: 'bg-emerald-500',
    icon: FiCheckCircle,
  },
  rejected: {
    label: 'Từ chối',
    bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200', dot: 'bg-slate-400',
    icon: FiXCircle,
  },
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DetailModal({ item, onClose, onUpdate }) {
  if (!item) return null;
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="my-4 w-full max-w-lg rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${cfg.bg} ${cfg.ring}`}>
              <StatusIcon className={`h-5 w-5 ${cfg.text}`} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Chi tiết yêu cầu bán sách</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                #{String(item._id).slice(-8).toUpperCase()} · {fmtDate(item.createdAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Status */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <StatusIcon className={`h-4.5 w-4.5 shrink-0 ${cfg.text}`} />
            <div className="flex-1">
              <p className="text-xs text-slate-500">Trạng thái hiện tại</p>
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* User info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Người gửi</p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <FiUser className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Tên</p>
                  <p className="text-sm font-medium text-slate-800">
                    {item.userId?.name || item.guestName || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FiPhone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Điện thoại</p>
                  <p className="text-sm font-medium text-slate-800">{item.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Địa chỉ</p>
                  <p className="text-sm font-medium text-slate-800">{item.address || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Book info */}
          {item.bookInfo && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thông tin sách
              </p>
              <div className="flex items-start gap-2.5">
                <FiBookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {item.bookInfo}
                </p>
              </div>
            </div>
          )}

          {/* Note */}
          {item.note && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ghi chú</p>
              <p className="text-sm text-slate-700 italic">{item.note}</p>
            </div>
          )}

          {/* Quick status update */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cập nhật trạng thái
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => {
                const sc = STATUS_CONFIG[s];
                const ScIcon = sc.icon;
                const active = item.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { onUpdate(item._id, s); onClose(); }}
                    disabled={active}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ring-1 transition ${
                      active
                        ? `${sc.bg} ${sc.text} ${sc.ring} cursor-default`
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <ScIcon className="h-3.5 w-3.5" />
                    {sc.label}
                    {active && <FiCheck className="h-3 w-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 rounded-b-2xl border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailItem, setDetailItem] = useState(null);

  const fetchList = () => {
    setLoading(true);
    api.get('/api/sell-requests')
      .then((d) => setList(Array.isArray(d) ? d : d.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/sell-requests/${id}`, { status });
      setList((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      if (detailItem?._id === id) setDetailItem((r) => ({ ...r, status }));
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const filtered = useMemo(() => {
    if (!statusFilter) return list;
    return list.filter((r) => r.status === statusFilter);
  }, [list, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    list.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [list]);

  const StatPill = ({ statusKey, label }) => {
    const cfg = STATUS_CONFIG[statusKey];
    if (!cfg) return null;
    const count = statusCounts[statusKey] || 0;
    return (
      <button
        type="button"
        onClick={() => setStatusFilter(statusFilter === statusKey ? '' : statusKey)}
        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ring-1 transition cursor-pointer ${
          statusFilter === statusKey
            ? `${cfg.bg} ${cfg.text} ${cfg.ring} ring-2 ${cfg.ring}`
            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
        {label}: <strong>{count}</strong>
      </button>
    );
  };

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Yêu cầu bán sách
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? '...' : `${filtered.length} yêu cầu`}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchList}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiRefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {/* Status pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        <StatPill statusKey="pending" label="Chờ xử lý" />
        <StatPill statusKey="viewed" label="Đã xem" />
        <StatPill statusKey="contacted" label="Đã liên hệ" />
        <StatPill statusKey="rejected" label="Từ chối" />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center">
          <FiPackage className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-700">
            {statusFilter ? 'Không có yêu cầu nào ở trạng thái này' : 'Chưa có yêu cầu bán sách nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={r._id}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${cfg.bg} ${cfg.ring}`}>
                      <StatusIcon className={`h-4.5 w-4.5 ${cfg.text}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate max-w-[140px]" title={r.userId?.name || r.guestName || 'Khách'}>
                        {r.userId?.name || r.guestName || 'Khách'}
                      </p>
                      <p className="text-xs text-slate-500">{fmtDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                {/* Book info */}
                {r.bookInfo && (
                  <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                    <p className="text-xs text-slate-500 mb-1">Thông tin sách</p>
                    <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                      {r.bookInfo}
                    </p>
                  </div>
                )}

                {/* Contact */}
                <div className="space-y-1.5 mb-4">
                  {r.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <FiPhone className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>{r.phone}</span>
                    </div>
                  )}
                  {r.address && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <FiMapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                      <span className="line-clamp-2">{r.address}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDetailItem(r)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <FiEye className="h-3.5 w-3.5" />
                    Xem chi tiết
                  </button>
                  <div className="relative ml-auto">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                      className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onUpdate={updateStatus}
        />
      )}
    </div>
  );
}
