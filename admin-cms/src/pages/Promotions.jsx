import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Promotions() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'percent', value: '', startDate: '', endDate: '' });

  useEffect(() => {
    api.get('/api/promotions').then(setList).catch(() => setList([]));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/promotions', { ...form, value: Number(form.value), startDate: new Date(form.startDate), endDate: new Date(form.endDate) });
      const data = await api.get('/api/promotions');
      setList(data);
      setForm({ name: '', type: 'percent', value: '', startDate: '', endDate: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa khuyến mãi này?')) return;
    try {
      await api.delete('/api/promotions/' + id);
      setList((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const inputCls = 'px-2 py-1.5 rounded border border-gray-300';
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Khuyến mãi</h1>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end mb-6">
        <input placeholder="Tên" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className={inputCls} />
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputCls}>
          <option value="percent">%</option>
          <option value="fixed">VND</option>
        </select>
        <input type="number" placeholder="Giá trị" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} required className={inputCls} />
        <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required className={inputCls} />
        <input type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required className={inputCls} />
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer">Thêm</button>
      </form>
      <ul className="list-none space-y-2">
        {list.map((p) => (
          <li key={p._id} className="flex items-center gap-2 py-2 border-b border-gray-100">
            {p.name} - {p.type === 'percent' ? p.value + '%' : p.value}
            <button type="button" onClick={() => handleDelete(p._id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
