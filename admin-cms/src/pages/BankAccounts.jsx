import { useState, useEffect } from 'react';
import api, { requestUpload } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';
const inputCls = 'px-2 py-1.5 rounded border border-gray-300 text-sm';

export default function BankAccounts() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ bankName: '', accountNumber: '', accountHolder: '', qrImage: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      setModalOpen(false);
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa tài khoản này?')) return;
    try {
      await api.delete('/api/bank-accounts/' + id);
      setList((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const handleUploadQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const data = await requestUpload('/api/books/upload', fd);
      const url = data?.urls?.[0] || '';
      if (!url) throw new Error('Không nhận được URL ảnh từ server');
      setForm((prev) => ({ ...prev, qrImage: url }));
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message || 'Upload ảnh QR thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Tài khoản ngân hàng</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 text-sm font-medium"
        >
          Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gray-700 text-white text-xs">
              <th className="px-3 py-2 text-left font-medium w-10">STT</th>
              <th className="px-3 py-2 text-left font-medium">Ngân hàng</th>
              <th className="px-3 py-2 text-left font-medium w-40">Số tài khoản</th>
              <th className="px-3 py-2 text-left font-medium w-40">Chủ tài khoản</th>
              <th className="px-3 py-2 text-left font-medium w-32">QR</th>
              <th className="px-3 py-2 text-left font-medium w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b, index) => (
              <tr key={b._id} className="border-t border-gray-100 hover:bg-gray-50 text-sm">
                <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                <td className="px-3 py-2 text-gray-800">{b.bankName}</td>
                <td className="px-3 py-2 text-gray-700">{b.accountNumber}</td>
                <td className="px-3 py-2 text-gray-700">{b.accountHolder}</td>
                <td className="px-3 py-2">
                  {b.qrImage ? (
                    <img
                      src={b.qrImage.startsWith('http') ? b.qrImage : API_URL + b.qrImage}
                      alt="QR"
                      className="w-14 h-14 object-contain rounded border border-gray-200"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Không có</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500 text-sm">
                  Chưa có tài khoản ngân hàng. Nhấn &quot;Thêm tài khoản&quot; để tạo mới.
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
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">Thêm tài khoản ngân hàng</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <label className="text-sm font-medium text-gray-700">
                Ngân hàng <span className="text-red-500">*</span>
                <input
                  placeholder="Tên ngân hàng"
                  value={form.bankName}
                  onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                  required
                  className={inputCls + ' mt-1'}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Số tài khoản <span className="text-red-500">*</span>
                <input
                  placeholder="Số tài khoản"
                  value={form.accountNumber}
                  onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                  required
                  className={inputCls + ' mt-1'}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Chủ tài khoản <span className="text-red-500">*</span>
                <input
                  placeholder="Tên chủ tài khoản"
                  value={form.accountHolder}
                  onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
                  required
                  className={inputCls + ' mt-1'}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Upload ảnh QR
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadQr}
                  disabled={uploading}
                  className="mt-1 block w-full text-sm text-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {uploading ? 'Đang upload ảnh...' : 'Hoặc nhập URL ảnh QR bên dưới.'}
                </p>
              </label>
              <label className="text-sm font-medium text-gray-700">
                URL QR
                <input
                  placeholder="https://... hoặc /uploads/..."
                  value={form.qrImage}
                  onChange={(e) => setForm((f) => ({ ...f, qrImage: e.target.value }))}
                  className={inputCls + ' mt-1'}
                />
              </label>
              {form.qrImage && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Xem trước ảnh QR</p>
                  <img
                    src={form.qrImage.startsWith('http') ? form.qrImage : API_URL + form.qrImage}
                    alt="QR preview"
                    className="w-28 h-28 object-contain rounded border border-gray-200 bg-white"
                  />
                </div>
              )}

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
