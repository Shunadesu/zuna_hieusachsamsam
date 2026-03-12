import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function Reports() {
  const [groupBy, setGroupBy] = useState('day');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    api.get(`/api/admin/reports/sales?from=${from.toISOString()}&to=${to.toISOString()}&groupBy=${groupBy}`)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setData(list.map((d) => {
        const id = d._id || {};
        let name = id.date || '';
        if (id.year && id.month) name = id.year + '-' + String(id.month).padStart(2, '0');
        if (id.year && id.week != null) name = id.year + '-W' + id.week;
        return { name: name || JSON.stringify(id), revenue: d.totalRevenue || 0, count: d.count || 0 };
      }));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [groupBy]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Báo cáo doanh số</h1>
      <div className="mb-4">
        <label className="text-gray-700">Nhóm theo </label>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="ml-2 px-2 py-1.5 rounded border border-gray-300">
          <option value="day">Theo ngày</option>
          <option value="week">Theo tuần</option>
          <option value="month">Theo tháng</option>
        </select>
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
            <thead><tr className="bg-gray-700 text-white"><th className="px-3 py-2 text-left">Kỳ</th><th className="px-3 py-2 text-left">Doanh thu</th><th className="px-3 py-2 text-left">Số đơn</th></tr></thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}><td className="px-3 py-2 border-t border-gray-100">{d.name}</td><td className="px-3 py-2 border-t border-gray-100">{Number(d.revenue).toLocaleString('vi-VN')} ₫</td><td className="px-3 py-2 border-t border-gray-100">{d.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
