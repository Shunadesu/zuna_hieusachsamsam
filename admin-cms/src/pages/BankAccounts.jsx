import { useState, useEffect } from 'react';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BankAccounts() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ bankName: '', accountNumber: '', accountHolder: '', qrImage: '' });

  useEffect(() => {
    api.get('/api/bank-accounts').then(setList).catch(() => setList([]));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/bank-accounts', form);
      const data = await api.get('/api/bank-accounts');
      setList(data);
      setForm({ bankName: '', accountNumber: '', accountHolder: '', qrImage: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa tài khoản này?')) return;
    try {
      await api.delete('/api/bank-accounts/' + id);
      setList((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const inputCls = 'px-2 py-1.5 rounded border border-gray-300';
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Tài khoản ngân hàng</h1>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end mb-6">
        <input placeholder="Ngân hàng" value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} required className={inputCls} />
        <input placeholder="Số tài khoản" value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} required className={inputCls} />
        <input placeholder="Chủ tài khoản" value={form.accountHolder} onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))} required className={inputCls} />
        <input placeholder="URL QR" value={form.qrImage} onChange={(e) => setForm((f) => ({ ...f, qrImage: e.target.value }))} className={inputCls} />
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer">Thêm</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => (
          <div key={b._id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
            <p className="text-sm text-gray-800">{b.bankName} - {b.accountNumber} - {b.accountHolder}</p>
            {b.qrImage && <img src={b.qrImage.startsWith('http') ? b.qrImage : API_URL + b.qrImage} alt="QR" className="w-[120px] h-[120px] object-contain rounded" />}
            <button type="button" onClick={() => handleDelete(b._id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs w-fit">Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}
