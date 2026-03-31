import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/useBookStore';
import { useCategoryStore } from '../store/useCategoryStore';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';
const inputCls = 'px-2 py-1.5 rounded border border-gray-300 text-sm';
const smallBtn = 'bg-gray-600 text-white px-2 py-1 rounded text-xs';
const PER_PAGE = 10;

export default function Books() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: '',
  });
  const [page, setPage] = useState(1);
  const { list, total, limit, fetchBooks, invalidate } = useBookStore();
  const { list: categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBooks({
      page,
      limit: PER_PAGE,
      search: filters.search || undefined,
      categoryId: filters.categoryId || undefined,
      minPrice: filters.minPrice === '' ? undefined : filters.minPrice,
      maxPrice: filters.maxPrice === '' ? undefined : filters.maxPrice,
      minQuantity: filters.minQuantity === '' ? undefined : filters.minQuantity,
      maxQuantity: filters.maxQuantity === '' ? undefined : filters.maxQuantity,
    });
  }, [page, filters.search, filters.categoryId, filters.minPrice, filters.maxPrice, filters.minQuantity, filters.maxQuantity, fetchBooks]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sách này?')) return;
    try {
      await api.delete(`/api/books/${id}`);
      invalidate();
      fetchBooks({
        page,
        limit: PER_PAGE,
        search: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        minPrice: filters.minPrice === '' ? undefined : filters.minPrice,
        maxPrice: filters.maxPrice === '' ? undefined : filters.maxPrice,
        minQuantity: filters.minQuantity === '' ? undefined : filters.minQuantity,
        maxQuantity: filters.maxQuantity === '' ? undefined : filters.maxQuantity,
      });
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const handleToggleHot = async (book) => {
    try {
      await api.put(`/api/books/${book._id}`, { isHot: !book.isHot });
      invalidate();
      fetchBooks({
        page,
        limit: PER_PAGE,
        search: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        minPrice: filters.minPrice === '' ? undefined : filters.minPrice,
        maxPrice: filters.maxPrice === '' ? undefined : filters.maxPrice,
        minQuantity: filters.minQuantity === '' ? undefined : filters.minQuantity,
        maxQuantity: filters.maxQuantity === '' ? undefined : filters.maxQuantity,
      });
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const imageList = (b) => (Array.isArray(b.images) && b.images.length > 0 ? b.images : b.image ? [b.image] : []);
  const imgUrl = (url) => (url && url.startsWith('http') ? url : API_URL + (url || ''));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Quản lý sách</h1>
        <Link
          to="/books/add"
          className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-600 text-sm font-medium"
        >
          Thêm sách
        </Link>
      </div>

      <form onSubmit={handleFilter} className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">Tên sách</span>
          <input
            placeholder="Tìm theo tên"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className={inputCls + ' w-40'}
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">Thể loại</span>
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
            className={inputCls + ' w-36'}
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">Giá từ (₫)</span>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            className={inputCls + ' w-24'}
            min={0}
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">Giá đến (₫)</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            className={inputCls + ' w-24'}
            min={0}
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">Số lượng từ</span>
          <input
            type="number"
            placeholder="Min"
            value={filters.minQuantity}
            onChange={(e) => setFilters((f) => ({ ...f, minQuantity: e.target.value }))}
            className={inputCls + ' w-20'}
            min={0}
          />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">Số lượng đến</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxQuantity}
            onChange={(e) => setFilters((f) => ({ ...f, maxQuantity: e.target.value }))}
            className={inputCls + ' w-20'}
            min={0}
          />
        </label>
        <button type="submit" className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700">
          Lọc
        </button>
      </form>

      <div className="bg-white rounded-lg overflow-hidden shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="px-2 py-2 text-left text-xs font-medium w-10">STT</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-24">Ảnh</th>
              <th className="px-2 py-2 text-left text-xs font-medium">Tên sách</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-28">Thể loại</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-24">Giá (₫)</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-24">Giá gốc (₫)</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-14">SL</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-16">Hot</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-24">Trạng thái</th>
              <th className="px-2 py-2 text-left text-xs font-medium w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b, index) => {
              const imgs = imageList(b);
              return (
                <tr key={b._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-2 text-gray-600 text-sm">{(page - 1) * limit + index + 1}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-0.5 flex-wrap">
                      {imgs.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        imgs.slice(0, 3).map((url, i) => (
                          <img
                            key={i}
                            src={imgUrl(url)}
                            alt=""
                            className="w-10 h-10 object-cover rounded border border-gray-200"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ))
                      )}
                      {imgs.length > 3 && <span className="text-xs text-gray-500">+{imgs.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-gray-800 text-sm max-w-[200px] truncate" title={b.title}>{b.title}</td>
                  <td className="px-2 py-2 text-gray-600 text-sm">{b.categoryId?.name ?? '—'}</td>
                  <td className="px-2 py-2 text-sm">{Number(b.price).toLocaleString('vi-VN')} ₫</td>
                  <td className="px-2 py-2 text-sm text-gray-600">{b.originalPrice != null ? Number(b.originalPrice).toLocaleString('vi-VN') + ' ₫' : '—'}</td>
                  <td className="px-2 py-2 text-sm">{b.quantity}</td>
                  <td className="px-2 py-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${b.isHot ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {b.isHot ? 'Hot' : '—'}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${b.status === 'out_of_stock' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {b.status === 'out_of_stock' ? 'Hết hàng' : 'Còn hàng'}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleHot(b)}
                        className={`${smallBtn} ${b.isHot ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                      >
                        {b.isHot ? 'Bỏ hot' : 'Chọn hot'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/books/edit/${b._id}`)}
                        className={smallBtn}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="px-3 py-8 text-center text-gray-500 text-sm">Không có sách. Nhấn &quot;Thêm sách&quot; để tạo mới.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-gray-600">
            Trang {page} / {totalPages} — Tổng {total} sách
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
