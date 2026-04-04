import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiSearch, FiFilter, FiX, FiEye, FiChevronLeft,
  FiChevronRight, FiRefreshCw, FiPackage, FiPhone,
  FiMail, FiMapPin, FiDollarSign, FiTruck,
} from 'react-icons/fi';
import api from '../services/api';

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'paid', 'shipping', 'completed', 'cancelled',
];

const STATUS_LABEL = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_COLOR = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-800', ring: 'ring-blue-200', dot: 'bg-blue-500' },
  paid: { bg: 'bg-cyan-50', text: 'text-cyan-800', ring: 'ring-cyan-200', dot: 'bg-cyan-500' },
  shipping: { bg: 'bg-violet-50', text: 'text-violet-800', ring: 'ring-violet-200', dot: 'bg-violet-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-800', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200', dot: 'bg-slate-400' },
};

const PAYMENT_LABEL = {
  bank_transfer: 'Chuyển khoản QR',
  cod: 'COD',
  direct: 'Trực tiếp',
};

const PAYMENT_ICON = {
  bank_transfer: '💳',
  cod: '💵',
  direct: '🤝',
};

const fmtVND = (n) =>
  (Number(n) || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const PAGE_SIZE = 15;

// ─── StatusBadge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${c.bg} ${c.text} ${c.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${c.dot}`} aria-hidden />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

// ─── OrderDetailModal ──────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onStatusChange }) {
  if (!order) return null;
  const guest = order.guestInfo || {};
  const subtotal = Math.max(0, Number(order.total) - Number(order.shippingFee));

  const handleStatus = (status) => {
    onStatusChange(order._id, status);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="my-4 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Chi tiết đơn hàng
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              #{String(order._id).slice(-8).toUpperCase()} · {fmtDate(order.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Status & Payment */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trạng thái
              </p>
              <select
                value={order.status}
                onChange={(e) => handleStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              {order.status === 'pending' && (
                <p className="mt-2 text-xs text-amber-600">
                  Cần xác nhận đơn hàng và kiểm tra thanh toán
                </p>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thanh toán
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
              </p>
              {order.paymentConfirmedAt && (
                <p className="mt-1 text-xs text-emerald-600">
                  Đã xác nhận {fmtDate(order.paymentConfirmedAt)}
                </p>
              )}
              {order.paymentNote && (
                <p className="mt-1 text-xs text-slate-500 italic">
                  Ghi chú: {order.paymentNote}
                </p>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Thông tin khách hàng
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <FiPackage className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Tên</p>
                  <p className="text-sm font-medium text-slate-800">
                    {order.userId?.name || guest.name || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FiPhone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Điện thoại</p>
                  <p className="text-sm font-medium text-slate-800">{guest.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FiMail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-800">{guest.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Địa chỉ giao hàng</p>
                  <p className="text-sm font-medium text-slate-800">{guest.address || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sách đã đặt ({order.items?.length ?? 0})
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90">
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sách
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Đơn giá
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      SL
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(order.items || []).map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 text-slate-800">{item.title || '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                        {fmtVND(item.price)}
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-700">{item.quantity ?? 1}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium text-slate-900">
                        {fmtVND((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tạm tính</span>
                <span className="tabular-nums">{fmtVND(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <FiTruck className="h-3.5 w-3.5" />
                  Phí vận chuyển
                </span>
                <span className="tabular-nums">{fmtVND(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                <span>Tổng cộng</span>
                <span className="tabular-nums text-emerald-700">{fmtVND(order.total)}</span>
              </div>
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

// ─── Main ──────────────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentMethod: '',
  });
  const [page, setPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/orders');
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrder = (id, status) => {
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    if (detailOrder?._id === id) setDetailOrder((o) => ({ ...o, status }));
  };

  const confirmPayment = async (id) => {
    try {
      await api.patch(`/api/orders/${id}/confirm-payment`, {});
      updateOrder(id, 'paid');
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}`, { status });
      updateOrder(id, status);
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return orders.filter((o) => {
      if (filters.status && o.status !== filters.status) return false;
      if (
        filters.paymentMethod &&
        o.paymentMethod !== filters.paymentMethod
      )
        return false;
      if (q) {
        const name = (o.guestInfo?.name || o.userId?.name || '').toLowerCase();
        const phone = (o.guestInfo?.phone || '').toLowerCase();
        const id = String(o._id).toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !id.includes(q))
          return false;
      }
      return true;
    });
  }, [orders, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageOrders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const clearFilters = () => setFilters({ search: '', status: '', paymentMethod: '' });
  const hasFilters = filters.search || filters.status || filters.paymentMethod;

  const IconBtn = ({ onClick, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Đơn hàng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? 'Đang tải...'
              : `${filtered.length} đơn${hasFilters ? ' (đã lọc)' : ''} — ${orders.filter((o) => o.status === 'pending').length} chờ xử lý`}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          title="Làm mới"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiRefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, hoặc mã đơn..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition"
            />
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>

          {/* Payment filter */}
          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              setFilters((f) => ({ ...f, paymentMethod: e.target.value }))
            }
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="bank_transfer">{PAYMENT_LABEL.bank_transfer}</option>
            <option value="cod">{PAYMENT_LABEL.cod}</option>
            <option value="direct">{PAYMENT_LABEL.direct}</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
            >
              <FiX className="h-3 w-3" />
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mã đơn
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Khách hàng
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ngày đặt
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Thanh toán
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tổng tiền
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trạng thái
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Không tìm thấy đơn hàng nào
                    </p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-2 text-sm font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
                      >
                        Xóa bộ lọc
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                pageOrders.map((o) => {
                  const name = o.guestInfo?.name || o.userId?.name || '—';
                  const shortId = String(o._id).slice(-8).toUpperCase();
                  return (
                    <tr
                      key={o._id}
                      className="group transition-colors hover:bg-slate-50/80"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className="cursor-pointer font-mono text-xs font-medium text-slate-900 hover:text-blue-600"
                          onClick={() => setDetailOrder(o)}
                          title="Xem chi tiết"
                        >
                          #{shortId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900 truncate max-w-[160px]" title={name}>
                          {name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {o.guestInfo?.phone || o.userId?.email || '—'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500 text-xs">
                        {fmtDate(o.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                          <span>{PAYMENT_ICON[o.paymentMethod]}</span>
                          {PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}
                          {o.paymentConfirmedAt && (
                            <FiDollarSign className="h-3 w-3 text-emerald-500" title="Đã xác nhận thanh toán" />
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                        {fmtVND(o.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailOrder(o)}
                            title="Xem chi tiết"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <FiEye className="h-3.5 w-3.5" />
                          </button>
                          {o.paymentMethod === 'bank_transfer' &&
                            o.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => confirmPayment(o._id)}
                                title="Xác nhận thanh toán"
                                className="flex h-8 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                              >
                                <FiDollarSign className="h-3.5 w-3.5" />
                                Xác nhận
                              </button>
                            )}
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400/30"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-600">
              Trang{' '}
              <span className="font-medium text-slate-900">{page}</span> /{' '}
              <span className="font-medium text-slate-900">{totalPages}</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="tabular-nums">{filtered.length}</span> đơn
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <FiChevronLeft className="h-4 w-4" />
                Trước
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
              >
                Sau
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
