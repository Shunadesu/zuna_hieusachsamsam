import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function Reports() {
  const [groupBy, setGroupBy] = useState('day');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
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
          list.map((d) => {
            const id = d._id || {};
            let name = id.date || '';
            if (id.year && id.month) name = id.year + '-' + String(id.month).padStart(2, '0');
            if (id.year && id.week != null) name = id.year + '-W' + id.week;
            return { name: name || JSON.stringify(id), revenue: d.totalRevenue || 0, count: d.count || 0 };
          }),
        );
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupBy, from, to]);

  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = data.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Báo cáo doanh số</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-gray-700 text-sm">Nhóm theo</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="ml-0 mt-1 px-2 py-1.5 rounded border border-gray-300 text-sm block"
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>
        </div>
        <div>
          <label className="text-gray-700 text-sm">Từ ngày</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="block mt-1 px-2 py-1.5 rounded border border-gray-300 text-sm"
          />
        </div>
        <div>
          <label className="text-gray-700 text-sm">Đến ngày</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block mt-1 px-2 py-1.5 rounded border border-gray-300 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-xs text-gray-500 mb-1">Tổng doanh thu</div>
          <div className="text-lg font-bold text-gray-800">
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-xs text-gray-500 mb-1">Tổng số đơn</div>
          <div className="text-lg font-bold text-gray-800">{totalOrders}</div>
        </div>
      </div>

      {loading && <p className="text-gray-600">Đang tải...</p>}
      {!loading && data.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 h-[400px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#37474f" name="Doanh thu (₫)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {!loading && data.length === 0 && <p className="text-gray-600">Chưa có dữ liệu.</p>}
      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-3 py-2 text-left">Kỳ</th>
                <th className="px-3 py-2 text-left">Doanh thu</th>
                <th className="px-3 py-2 text-left">Số đơn</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 border-t border-gray-100">{d.name}</td>
                  <td className="px-3 py-2 border-t border-gray-100">
                    {Number(d.revenue).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-3 py-2 border-t border-gray-100">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
