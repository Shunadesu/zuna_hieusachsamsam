import { useState, useEffect } from 'react';
import api from '../services/api';

export default function SellRequests() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/api/sell-requests').then(setList).catch(() => setList([]));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/sell-requests/${id}`, { status });
      setList((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu bán sách</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg overflow-hidden">
          <thead><tr className="bg-gray-700 text-white"><th className="px-3 py-2 text-left">Người gửi</th><th className="px-3 py-2 text-left">Thông tin sách</th><th className="px-3 py-2 text-left">SĐT</th><th className="px-3 py-2 text-left">Địa chỉ</th><th className="px-3 py-2 text-left">Trạng thái</th><th className="px-3 py-2 text-left">Thao tác</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r._id}>
                <td className="px-3 py-2 border-t border-gray-100">{r.userId?.name || r.userId?.email || '-'}</td>
                <td className="px-3 py-2 border-t border-gray-100">{r.bookInfo}</td>
                <td className="px-3 py-2 border-t border-gray-100">{r.phone}</td>
                <td className="px-3 py-2 border-t border-gray-100">{r.address}</td>
                <td className="px-3 py-2 border-t border-gray-100">{r.status}</td>
                <td className="px-3 py-2 border-t border-gray-100">
                  <select value={r.status} onChange={(e) => updateStatus(r._id, e.target.value)} className="px-2 py-1 rounded border border-gray-300 text-sm">
                    <option value="pending">pending</option>
                    <option value="viewed">viewed</option>
                    <option value="contacted">contacted</option>
                    <option value="rejected">rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
