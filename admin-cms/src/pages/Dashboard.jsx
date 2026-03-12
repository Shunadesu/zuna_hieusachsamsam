import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, books: 0, categories: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/api/orders').then((d) => (Array.isArray(d) ? d : d.data || d)).catch(() => []),
      api.get('/api/books?limit=1').then((d) => d.total ?? 0).catch(() => 0),
      api.get('/api/categories').then((d) => (Array.isArray(d) ? d : []).length).catch(() => 0),
    ]).then(([orders, books, categories]) => {
      setStats({ orders: Array.isArray(orders) ? orders.length : 0, books, categories });
    });
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Tổng quan</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5 mb-4">
        <div className="bg-white rounded-lg shadow p-2.5 flex flex-col gap-0.5">
          <span className="text-xs font-medium text-gray-500">Đơn hàng</span>
          <span className="text-xl font-bold text-gray-800">{stats.orders}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-2.5 flex flex-col gap-0.5">
          <span className="text-xs font-medium text-gray-500">Sách</span>
          <span className="text-xl font-bold text-gray-800">{stats.books}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-2.5 flex flex-col gap-0.5">
          <span className="text-xs font-medium text-gray-500">Thể loại</span>
          <span className="text-xl font-bold text-gray-800">{stats.categories}</span>
        </div>
      </div>
    </div>
  );
}
