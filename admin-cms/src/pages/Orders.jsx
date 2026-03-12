import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/api/orders').then((d) => setOrders(Array.isArray(d) ? d : d.data || [])).catch(() => setOrders([]));
  }, []);

  const confirmPayment = async (id) => {
    try {
      await api.patch('/api/orders/' + id + '/confirm-payment', {});
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: 'paid' } : o)));
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch('/api/orders/' + id, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg">
          <thead><tr className="bg-gray-700 text-white"><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Khách</th><th className="px-3 py-2 text-left">Tổng</th><th className="px-3 py-2 text-left">Trạng thái</th><th className="px-3 py-2 text-left">Thao tác</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="px-3 py-2 border-t border-gray-100">{o._id ? o._id.slice(-8) : ''}</td>
                <td className="px-3 py-2 border-t border-gray-100">{o.guestInfo?.name || (o.userId && o.userId.name) || '-'}</td>
                <td className="px-3 py-2 border-t border-gray-100">{Number(o.total || 0).toLocaleString('vi-VN')} ₫</td>
                <td className="px-3 py-2 border-t border-gray-100">{o.status}</td>
                <td className="px-3 py-2 border-t border-gray-100">
                  {o.status !== 'paid' && <button type="button" onClick={() => confirmPayment(o._id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-2">Xác nhận thanh toán</button>}
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} className="px-2 py-1 rounded border border-gray-300 text-sm">
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="completed">completed</option>
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
