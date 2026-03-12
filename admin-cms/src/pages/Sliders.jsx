import { useState, useEffect } from 'react';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Sliders() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ image: '', link: '', order: 0 });

  useEffect(() => {
    api.get('/api/sliders').then(setList).catch(() => setList([]));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/sliders', form);
      const data = await api.get('/api/sliders');
      setList(data);
      setForm({ image: '', link: '', order: 0 });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa slide này?')) return;
    try {
      await api.delete(`/api/sliders/${id}`);
      setList((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const inputCls = 'px-2 py-1.5 rounded border border-gray-300';
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Slider</h1>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end mb-6">
        <input placeholder="URL ảnh" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} required className={inputCls} />
        <input placeholder="Link" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className={inputCls} />
        <input type="number" placeholder="Thứ tự" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} className={inputCls} />
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer">Thêm</button>
      </form>
      <div className="flex flex-wrap gap-4">
        {list.map((s) => (
          <div key={s._id} className="bg-white rounded-lg shadow p-2 flex flex-col gap-1">
            <img src={s.image && s.image.startsWith('http') ? s.image : API_URL + (s.image || '')} alt="" className="w-[200px] h-[100px] object-cover rounded" />
            <p className="text-xs text-gray-600">{s.link || '-'}</p>
            <button type="button" onClick={() => handleDelete(s._id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs mt-1 w-fit">Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}
