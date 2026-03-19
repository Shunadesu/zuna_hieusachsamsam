import { useState, useEffect, useMemo, useRef } from 'react';
import { useCategoryStore } from '../store/useCategoryStore';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';

export default function Categories() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [createPreview, setCreatePreview] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', image: '', order: 0 });
  const [editPreview, setEditPreview] = useState('');
  const createObjectUrlRef = useRef('');
  const editObjectUrlRef = useRef('');

  const { list, fetchCategories, invalidate } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    return () => {
      if (createObjectUrlRef.current) URL.revokeObjectURL(createObjectUrlRef.current);
      if (editObjectUrlRef.current) URL.revokeObjectURL(editObjectUrlRef.current);
    };
  }, []);

  const sorted = useMemo(
    () => [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name)),
    [list]
  );

  const reloadCategories = async () => {
    invalidate();
    await fetchCategories();
  };

  const resolveImageSrc = (value) => {
    if (!value) return '';
    return value.startsWith('http') || value.startsWith('blob:') ? value : API_URL + value;
  };

  const uploadCategoryImage = async (file) => {
    if (!file) return '';
    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('images', file);
      const res = await fetch(`${API_URL}/api/books/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Upload ảnh thất bại');
      return data?.urls?.[0] || '';
    } finally {
      setUploading(false);
    }
  };

  const handleUploadForCreate = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (createObjectUrlRef.current) URL.revokeObjectURL(createObjectUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    createObjectUrlRef.current = localPreview;
    setCreatePreview(localPreview);
    try {
      const url = await uploadCategoryImage(file);
      if (url) setImage(url);
      else alert('Không nhận được URL ảnh từ server.');
    } catch (err) {
      alert(err.message || 'Upload ảnh thất bại.');
    } finally {
      e.target.value = '';
    }
  };

  const handleUploadForEdit = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (editObjectUrlRef.current) URL.revokeObjectURL(editObjectUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    editObjectUrlRef.current = localPreview;
    setEditPreview(localPreview);
    try {
      const url = await uploadCategoryImage(file);
      if (url) setEditForm((prev) => ({ ...prev, image: url }));
      else alert('Không nhận được URL ảnh từ server.');
    } catch (err) {
      alert(err.message || 'Upload ảnh thất bại.');
    } finally {
      e.target.value = '';
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/api/categories', {
        name: name.trim(),
        image,
        order: Number(order) || 0,
      });
      await reloadCategories();
      setName('');
      setImage('');
      setOrder(0);
      setCreatePreview('');
      if (createObjectUrlRef.current) {
        URL.revokeObjectURL(createObjectUrlRef.current);
        createObjectUrlRef.current = '';
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditModal = (category) => {
    setEditTarget(category);
    setEditForm({
      name: category.name || '',
      image: category.image || '',
      order: category.order ?? 0,
    });
    setEditPreview('');
    if (editObjectUrlRef.current) {
      URL.revokeObjectURL(editObjectUrlRef.current);
      editObjectUrlRef.current = '';
    }
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.name.trim()) return;
    try {
      await api.put(`/api/categories/${editTarget._id}`, {
        name: editForm.name.trim(),
        image: editForm.image,
        order: Number(editForm.order) || 0,
      });
      await reloadCategories();
      setEditModalOpen(false);
      setEditTarget(null);
      setEditPreview('');
      if (editObjectUrlRef.current) {
        URL.revokeObjectURL(editObjectUrlRef.current);
        editObjectUrlRef.current = '';
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa thể loại?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      await reloadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickOrderChange = async (id, value) => {
    try {
      await api.put(`/api/categories/${id}`, { order: Number(value) || 0 });
      await reloadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const moveCategory = async (id, direction) => {
    const idx = sorted.findIndex((c) => c._id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const current = sorted[idx];
    const target = sorted[targetIdx];
    const currentOrder = current.order ?? idx;
    const targetOrder = target.order ?? targetIdx;

    try {
      await api.put(`/api/categories/${current._id}`, { order: targetOrder });
      await api.put(`/api/categories/${target._id}`, { order: currentOrder });
      await reloadCategories();
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
              <th className="px-3 py-2 text-left text-sm font-medium w-32">Ảnh</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Tên thể loại</th>
              <th className="px-3 py-2 text-left text-sm font-medium w-44">Thứ tự</th>
              <th className="px-3 py-2 text-left text-sm font-medium w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, index) => (
              <tr key={c._id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-600 text-sm">{index + 1}</td>
                <td className="px-3 py-2">
                  {c.image ? (
                    <img
                      src={c.image.startsWith('http') ? c.image : API_URL + c.image}
                      alt={c.name}
                      className="w-24 h-14 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Chưa có ảnh</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="text-gray-800 text-sm">{c.name}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveCategory(c._id, 'up')} className={smallBtn} title="Lên">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveCategory(c._id, 'down')} className={smallBtn} title="Xuống">
                      ↓
                    </button>
                    <input
                      type="number"
                      defaultValue={c.order ?? 0}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                      onBlur={(e) => handleQuickOrderChange(c._id, e.target.value)}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEditModal(c)} className={smallBtn}>Sửa</button>
                    <button type="button" onClick={() => handleDelete(c._id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
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
              <label className="text-sm font-medium text-gray-700">
                Upload ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadForCreate}
                  disabled={uploading}
                  className="mt-1 block w-full text-sm text-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">Hoặc nhập URL ảnh bên dưới.</p>
              </label>
              <label className="text-sm font-medium text-gray-700">
                URL ảnh
                <input
                  type="text"
                  placeholder="/uploads/... hoặc https://..."
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    if (createObjectUrlRef.current) {
                      URL.revokeObjectURL(createObjectUrlRef.current);
                      createObjectUrlRef.current = '';
                    }
                    setCreatePreview('');
                  }}
                  className={inputCls + ' mt-1'}
                />
              </label>
              {(createPreview || image) && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Xem trước ảnh</p>
                  <img
                    src={resolveImageSrc(createPreview || image)}
                    alt="Xem trước ảnh thể loại"
                    className="w-36 h-24 object-cover rounded border border-gray-200"
                  />
                </div>
              )}
              <label className="text-sm font-medium text-gray-700">
                Thứ tự
                <input
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className={inputCls + ' mt-1 max-w-[120px]'}
                />
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setName('');
                    setImage('');
                    setOrder(0);
                    setCreatePreview('');
                    if (createObjectUrlRef.current) {
                      URL.revokeObjectURL(createObjectUrlRef.current);
                      createObjectUrlRef.current = '';
                    }
                  }}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
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

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Sửa thể loại</h2>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <label className="text-sm font-medium text-gray-700">
                Tên thể loại
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputCls + ' mt-1'}
                  autoFocus
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Upload ảnh mới
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadForEdit}
                  disabled={uploading}
                  className="mt-1 block w-full text-sm text-gray-700"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                URL ảnh
                <input
                  type="text"
                  value={editForm.image}
                  onChange={(e) => {
                    setEditForm((prev) => ({ ...prev, image: e.target.value }));
                    if (editObjectUrlRef.current) {
                      URL.revokeObjectURL(editObjectUrlRef.current);
                      editObjectUrlRef.current = '';
                    }
                    setEditPreview('');
                  }}
                  className={inputCls + ' mt-1'}
                />
              </label>
              {(editPreview || editForm.image) && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Xem trước ảnh</p>
                  <img
                    src={resolveImageSrc(editPreview || editForm.image)}
                    alt="Xem trước ảnh thể loại"
                    className="w-36 h-24 object-cover rounded border border-gray-200"
                  />
                </div>
              )}
              <label className="text-sm font-medium text-gray-700">
                Thứ tự
                <input
                  type="number"
                  min={0}
                  value={editForm.order}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, order: e.target.value }))}
                  className={inputCls + ' mt-1 max-w-[120px]'}
                />
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditPreview('');
                    if (editObjectUrlRef.current) {
                      URL.revokeObjectURL(editObjectUrlRef.current);
                      editObjectUrlRef.current = '';
                    }
                  }}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

