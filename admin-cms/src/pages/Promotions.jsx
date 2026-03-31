import { useState, useEffect } from 'react';
import api from '../services/api';

const inputCls = 'px-2 py-1.5 rounded border border-gray-300 text-sm';

export default function Promotions() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'percent', value: '', startDate: '', endDate: '' });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get('/api/promotions').then(setList).catch(() => setList([]));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/promotions', {
        ...form,
        value: Number(form.value),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      });
      const data = await api.get('/api/promotions');
      setList(data);
      setForm({ name: '', type: 'percent', value: '', startDate: '', endDate: '' });
      setModalOpen(false);
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa khuyến mãi này?')) return;
    try {
      await api.delete('/api/promotions/' + id);
      setList((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const formatValue = (p) => (p.type === 'percent' ? `${p.value}%` : `${Number(p.value).toLocaleString('vi-VN')} ₫`);
  const formatDate = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '—');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Khuyến mãi</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 text-sm font-medium"
        >
          Thêm khuyến mãi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-700 text-white text-xs">
              <th className="px-3 py-2 text-left font-medium w-10">STT</th>
              <th className="px-3 py-2 text-left font-medium">Tên</th>
              <th className="px-3 py-2 text-left font-medium w-28">Loại</th>
              <th className="px-3 py-2 text-left font-medium w-32">Giá trị</th>
              <th className="px-3 py-2 text-left font-medium w-40">Bắt đầu</th>
              <th className="px-3 py-2 text-left font-medium w-40">Kết thúc</th>
              <th className="px-3 py-2 text-left font-medium w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, index) => (
              <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50 text-sm">
                <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                <td className="px-3 py-2 text-gray-800">{p.name}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                    {p.type === 'percent' ? 'Giảm %' : 'Giảm tiền'}
                  </span>
                </td>
                <td className="px-3 py-2">{formatValue(p)}</td>
                <td className="px-3 py-2 text-gray-600">{formatDate(p.startDate)}</td>
                <td className="px-3 py-2 text-gray-600">{formatDate(p.endDate)}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500 text-sm">
                  Chưa có khuyến mãi. Nhấn &quot;Thêm khuyến mãi&quot; để tạo mới.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">Thêm khuyến mãi</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Tên <span className="text-red-500">*</span>
                  <input
                    placeholder="Tên khuyến mãi"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className={inputCls + ' mt-1'}
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Loại
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className={inputCls + ' mt-1'}
                  >
                    <option value="percent">Theo %</option>
                    <option value="fixed">Theo số tiền</option>
                  </select>
                </label>
              </div>

              <label className="text-sm font-medium text-gray-700">
                Giá trị <span className="text-red-500">*</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Ví dụ: 10 hoặc 50000"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  required
                  className={inputCls + ' mt-1 max-w-xs'}
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Bắt đầu <span className="text-red-500">*</span>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    required
                    className={inputCls + ' mt-1'}
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Kết thúc <span className="text-red-500">*</span>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    required
                    className={inputCls + ' mt-1'}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 text-sm font-medium"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
