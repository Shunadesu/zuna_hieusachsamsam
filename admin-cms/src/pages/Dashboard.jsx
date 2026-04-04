import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Sector,
} from 'recharts';
import { FiShoppingBag, FiBook, FiGrid, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtVND = (n) =>
  (Number(n) || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_LABEL = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_COLOR = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  paid: '#06b6d4',
  shipping: '#8b5cf6',
  completed: '#22c55e',
  cancelled: '#94a3b8',
};

const PAYMENT_LABEL = {
  bank_transfer: 'QR / CK',
  cod: 'COD',
  direct: 'Trực tiếp',
};

// ─── Components ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'slate', loading }) {
  const colorMap = {
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  };
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${colorMap[color] || colorMap.slate}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-7 w-16 animate-pulse rounded-md bg-slate-100" />
        ) : (
          <p className="mt-1 text-xl font-bold text-slate-900 truncate">{value}</p>
        )}
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

function RechartsTooltip({ content }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs shadow-lg">
      {content}
    </div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <RechartsTooltip>
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-emerald-700 font-medium">Doanh thu: {fmtVND(payload[0]?.value)}</p>
      <p className="text-slate-500">Đơn hàng: {payload[1]?.value ?? 0}</p>
    </RechartsTooltip>
  );
}

function OrderStatusTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: extra } = payload[0];
  return (
    <RechartsTooltip>
      <p className="font-semibold text-slate-700">{name}</p>
      <p className="text-slate-500">{value} đơn</p>
      {extra?.percent != null && <p className="text-slate-400">{extra.percent}%</p>}
    </RechartsTooltip>
  );
}

function TopBookItem({ rank, title, qty, revenue }) {
  const pct = Math.min(100, (qty / (revenue || 1)) * 100);
  return (
    <div className="flex items-center gap-3 py-2">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rank <= 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800" title={title}>{title}</p>
        <p className="text-xs text-slate-400">{qty} đã bán · {fmtVND(revenue)}</p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then((data) => { setStats(data); setLoading(false); })
      .catch((err) => {
        if (!err?.silentAuthRedirect) setError(err.message);
        setLoading(false);
      });
  }, []);

  const pieData = stats
    ? Object.entries(stats.statusCounts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({
          name: STATUS_LABEL[name] || name,
          value,
          color: STATUS_COLOR[name] || '#94a3b8',
          key: name,
          percent: stats.totalOrders > 0
            ? Math.round((value / stats.totalOrders) * 100)
            : 0,
        }))
    : [];

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      </g>
    );
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <FiAlertCircle className="h-4 w-4 shrink-0" />
        Không tải được dữ liệu: {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tổng quan</h1>
        <p className="mt-1 text-sm text-slate-500">Số liệu tổng hợp cho admin quản lý cửa hàng sách</p>
      </div>

      {/* ── Stats cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          icon={FiShoppingBag}
          label="Tổng đơn hàng"
          value={stats?.totalOrders ?? 0}
          sub={`${stats?.statusCounts?.completed ?? 0} hoàn thành`}
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={FiBook}
          label="Sách trong kho"
          value={stats?.totalBooks ?? 0}
          sub={`${stats?.soldBooks ?? 0} đã bán`}
          color="emerald"
          loading={loading}
        />
        <StatCard
          icon={FiGrid}
          label="Thể loại"
          value={stats?.totalCategories ?? 0}
          color="violet"
          loading={loading}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Doanh thu tháng"
          value={loading ? '...' : fmtVND(stats?.monthRevenue)}
          sub={`Tổng: ${fmtVND(stats?.totalRevenue)}`}
          color="emerald"
          loading={loading}
        />
        <StatCard
          icon={FiAlertCircle}
          label="Sách hết hàng"
          value={stats?.outOfStockBooks ?? 0}
          color="amber"
          loading={loading}
        />
        <StatCard
          icon={FiDollarSign}
          label="Đơn chờ thanh toán"
          value={stats?.statusCounts?.pending ?? 0}
          sub={`${stats?.statusCounts?.confirmed ?? 0} đã xác nhận`}
          color="rose"
          loading={loading}
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Doanh thu 6 tháng gần nhất
            </h2>
            {!loading && stats?.monthly && (
              <p className="text-xs text-slate-400">
                Tháng hiện tại: <span className="font-medium text-emerald-600">{fmtVND(stats.monthly[stats.monthly.length - 1]?.revenue)}</span>
              </p>
            )}
          </div>
          {loading ? (
            <div className="flex items-end gap-1.5 h-52">
              {[65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 animate-pulse rounded-t bg-slate-100" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <BarChart data={stats?.monthly || []} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <ReTooltip content={<RevenueTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {(stats?.monthly || []).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === (stats?.monthly?.length ?? 0) - 1 ? '#10b981' : '#e2e8f0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order status pie */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-800 uppercase tracking-wide">
            Đơn hàng theo trạng thái
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-52">
              <div className="h-32 w-32 animate-pulse rounded-full bg-slate-100" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="flex h-52 items-center justify-center text-sm text-slate-400">Chưa có đơn hàng</div>
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  activeIndex={pieData.findIndex((p) => p.key === activeStatus)}
                  onMouseEnter={(_, idx) => setActiveStatus(pieData[idx]?.key)}
                  activeShape={renderActiveShape}
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip content={<OrderStatusTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          {!loading && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {pieData.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onMouseEnter={() => setActiveStatus(item.key)}
                  onMouseLeave={() => setActiveStatus(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  {item.name} ({item.value})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Top selling books */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 uppercase tracking-wide">
            Sách bán chạy
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats?.topBooks?.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-0 divide-y divide-slate-100">
              {(stats?.topBooks || []).map((b, i) => (
                <TopBookItem
                  key={b.bookId + i}
                  rank={i + 1}
                  title={b.title}
                  qty={b.quantity}
                  revenue={b.revenue}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Đơn hàng gần đây
            </h2>
            <span className="text-xs text-slate-400">
              {loading ? '...' : `${stats?.recentOrders?.length ?? 0} đơn mới nhất`}
            </span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 flex-1 rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats?.recentOrders?.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Chưa có đơn hàng</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Mã / Khách</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Tổng</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Thanh toán</th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recentOrders || []).map((o) => {
                    const name = o.userId?.name || o.guestInfo?.name || '—';
                    const shortId = String(o._id).slice(-6).toUpperCase();
                    const statusColor = STATUS_COLOR[o.status] || '#94a3b8';
                    return (
                      <tr key={o._id} className="group">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-slate-800 truncate max-w-[130px]" title={name}>{name}</p>
                          <p className="text-xs text-slate-400">#{shortId}</p>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 text-xs whitespace-nowrap">
                          {fmtDateTime(o.createdAt)}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                          {fmtVND(o.total)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-xs text-slate-500 whitespace-nowrap">
                          {PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ color: statusColor, background: statusColor + '18' }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
                            {STATUS_LABEL[o.status] || o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
