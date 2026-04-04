import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FiTrendingUp, FiShoppingCart, FiBarChart2, FiCalendar,
  FiRefreshCw, FiChevronDown,
} from 'react-icons/fi';
import api from '../services/api';

const fmtVND = (n) =>
  (Number(n) || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

const GROUP_OPTIONS = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'week', label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
];

const PRESETS = [
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 },
  { label: '1 năm', days: 365 },
];

function fmtGroupName(id) {
  if (id.date) return id.date.slice(0, 10);
  if (id.year && id.month) return `${id.year}-${String(id.month).padStart(2, '0')}`;
  if (id.year && id.week != null) return `${id.year}-W${id.week}`;
  return JSON.stringify(id || {});
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-700">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {entry.name === 'Doanh thu' ? fmtVND(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Reports() {
  const [groupBy, setGroupBy] = useState('day');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area');

  const fetchData = async () => {
    setLoading(true);
    try {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      const res = await api.get(
        `/api/admin/reports/sales?from=${fromDate.toISOString()}&to=${toDate.toISOString()}&groupBy=${groupBy}`,
      );
      const list = Array.isArray(res) ? res : [];
      setData(
        list.map((d) => ({
          name: fmtGroupName(d._id || {}),
          revenue: d.totalRevenue || 0,
          count: d.count || 0,
        })),
      );
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupBy, from, to]);

  const totalRevenue = useMemo(
    () => data.reduce((sum, d) => sum + (d.revenue || 0), 0),
    [data],
  );
  const totalOrders = useMemo(
    () => data.reduce((sum, d) => sum + (d.count || 0), 0),
    [data],
  );
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const setPreset = (days) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    setFrom(fromDate.toISOString().slice(0, 10));
    setTo(toDate.toISOString().slice(0, 10));
  };

  const chartData = useMemo(() => {
    if (!data.length) return [];
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const TickFormatter = (v) => {
    if (v.length > 10) return v.slice(5);
    return v;
  };

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Báo cáo doanh số</h1>
          <p className="mt-1 text-sm text-slate-500">
            Thống kê doanh thu và đơn hàng theo thời gian
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Summary stats */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <FiTrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng doanh thu</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {loading ? (
                <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-100" />
              ) : (
                fmtVND(totalRevenue)
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
            <FiShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng đơn hàng</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {loading ? (
                <span className="inline-block h-5 w-16 animate-pulse rounded bg-slate-100" />
              ) : (
                totalOrders.toLocaleString('vi-VN')
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-200">
            <FiBarChart2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Giá trị trung bình / đơn</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {loading ? (
                <span className="inline-block h-5 w-24 animate-pulse rounded bg-slate-100" />
              ) : (
                fmtVND(avgOrderValue)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPreset(p.days)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:border-slate-300"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Group by */}
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30"
            >
              {GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              />
            </div>
            <span className="text-sm text-slate-400">—</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30"
            />
          </div>

          {/* Chart type */}
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                chartType === 'line'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="mb-5 h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      ) : data.length === 0 ? (
        <div className="mb-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center">
          <FiBarChart2 className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-700">Chưa có dữ liệu trong khoảng thời gian này</p>
          <p className="mt-1 text-sm text-slate-500">Thử chọn khoảng thời gian khác</p>
        </div>
      ) : (
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Biểu đồ doanh thu & đơn hàng</h3>
              <p className="text-xs text-slate-500">
                {chartData.length} kỳ · {data.reduce((s, d) => s + d.count, 0)} đơn
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={TickFormatter} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  iconType="circle" iconSize={8}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} dot={false} />
                <Area yAxisId="right" type="monotone" dataKey="count" name="Số đơn" stroke="#6366f1" fill="url(#colorCount)" strokeWidth={2} dot={false} />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={TickFormatter} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                  iconType="circle" iconSize={8}
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Số đơn" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Kỳ</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Doanh thu</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Số đơn</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">TB / đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((d, i) => {
                const avg = d.count > 0 ? d.revenue / d.count : 0;
                return (
                  <tr key={i} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{d.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-900">{fmtVND(d.revenue)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">{d.count}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-500">{fmtVND(avg)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
