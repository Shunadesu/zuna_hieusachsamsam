import { useState, useEffect } from 'react';
import { useCategoryStore } from '../store/useCategoryStore';
import api from '../services/api';

export default function Categories() {
  const [name, setName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { list, fetchCategories, invalidate } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/api/categories', { name: name.trim() });
      invalidate();
      fetchCategories();
      setName('');
      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (id, newName) => {
    try {
      await api.put(`/api/categories/${id}`, { name: newName });
      invalidate();
      fetchCategories();
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa thể loại?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      invalidate();
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const inputCls = 'px-2 py-1.5 rounded border border-gray-300 w-full';
  const smallBtn = 'bg-gray-600 text-white px-2 py-1 rounded text-xs';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Thể loại</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 text-sm font-medium"
        >
          Thêm thể loại
        </button>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="px-3 py-2 text-left text-sm font-medium w-14">STT</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Tên thể loại</th>
              <th className="px-3 py-2 text-left text-sm font-medium w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c, index) => (
              <tr key={c._id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-600 text-sm">{index + 1}</td>
                <td className="px-3 py-2">
                  {editing === c._id ? (
                    <div className="flex items-center gap-2">
                      <input id={`edit-${c._id}`} defaultValue={c.name} className={inputCls + ' max-w-xs'} />
                      <button type="button" onClick={() => handleUpdate(c._id, document.getElementById(`edit-${c._id}`)?.value)} className={smallBtn}>Lưu</button>
                      <button type="button" onClick={() => setEditing(null)} className={smallBtn}>Hủy</button>
                    </div>
                  ) : (
                    <span className="text-gray-800">{c.name}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editing !== c._id && (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setEditing(c._id)} className={smallBtn}>Sửa</button>
                      <button type="button" onClick={() => handleDelete(c._id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">Xóa</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="px-3 py-8 text-center text-gray-500 text-sm">Chưa có thể loại. Nhấn &quot;Thêm thể loại&quot; để tạo mới.</div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Thêm thể loại</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <label className="text-sm font-medium text-gray-700">
                Tên thể loại
                <input
                  type="text"
                  placeholder="Nhập tên thể loại"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls + ' mt-1'}
                  autoFocus
                />
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setName(''); }} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium">
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
