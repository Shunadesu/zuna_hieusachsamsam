import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiEdit2,
  FiTrash2,
  FiStar,
  FiRotateCcw,
  FiShoppingBag,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useBookStore } from '../store/useBookStore';
import { useCategoryStore } from '../store/useCategoryStore';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store';
const PER_PAGE = 10;

const inputBase =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition';

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

  const queryParams = useMemo(
    () => ({
      page,
      limit: PER_PAGE,
      search: filters.search || undefined,
      categoryId: filters.categoryId || undefined,
      minPrice: filters.minPrice === '' ? undefined : filters.minPrice,
      maxPrice: filters.maxPrice === '' ? undefined : filters.maxPrice,
      minQuantity: filters.minQuantity === '' ? undefined : filters.minQuantity,
      maxQuantity: filters.maxQuantity === '' ? undefined : filters.maxQuantity,
    }),
    [
      page,
      filters.search,
      filters.categoryId,
      filters.minPrice,
      filters.maxPrice,
      filters.minQuantity,
      filters.maxQuantity,
    ],
  );

  const reloadBooks = useCallback(() => {
    fetchBooks(queryParams);
  }, [fetchBooks, queryParams]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    reloadBooks();
  }, [reloadBooks]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      minQuantity: '',
      maxQuantity: '',
    });
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sách này?')) return;
    try {
      await api.delete(`/api/books/${id}`);
      invalidate();
      reloadBooks();
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const handleToggleHot = async (book) => {
    try {
      await api.put(`/api/books/${book._id}`, { isHot: !book.isHot });
      invalidate();
      reloadBooks();
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const handleSold = async (book) => {
    if (
      !confirm(
        book.status === 'sold'
          ? 'Hoàn tác sách này (trả về còn hàng)?'
          : 'Đánh dấu sách này là đã bán?',
      )
    )
      return;
    try {
      if (book.status === 'sold') {
        await api.put(`/api/books/${book._id}`, {
          status: 'available',
          quantity: 1,
        });
      } else {
        await api.patch(`/api/books/${book._id}/sold`);
      }
      invalidate();
      reloadBooks();
    } catch (err) {
      if (!err?.silentAuthRedirect) alert(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const imageList = (b) =>
    Array.isArray(b.images) && b.images.length > 0
      ? b.images
      : b.image
        ? [b.image]
        : [];
  const imgUrl = (url) =>
    url && url.startsWith('http') ? url : API_URL + (url || '');

  const IconBtn = ({ onClick, title, children, className = '', disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm transition disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-[1400px]">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Quản lý sách
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tìm kiếm, lọc và cập nhật danh mục sách — tổng{' '}
            <span className="font-medium text-slate-700">{total}</span> đầu sách
          </p>
        </div>
        <Link
          to="/books/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus className="h-4 w-4" aria-hidden />
          Thêm sách
        </Link>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilter}
        className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">Bộ lọc</h2>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              Tên sách
            </span>
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Tìm theo tên..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className={inputBase + ' pl-9'}
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              Thể loại
            </span>
            <select
              value={filters.categoryId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, categoryId: e.target.value }))
              }
              className={inputBase}
            >
              <option value="">Tất cả thể loại</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              Giá từ (₫)
            </span>
            <input
              type="number"
              placeholder="Tối thiểu"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters((f) => ({ ...f, minPrice: e.target.value }))
              }
              className={inputBase}
              min={0}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              Giá đến (₫)
            </span>
            <input
              type="number"
              placeholder="Tối đa"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((f) => ({ ...f, maxPrice: e.target.value }))
              }
              className={inputBase}
              min={0}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              SL từ
            </span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minQuantity}
              onChange={(e) =>
                setFilters((f) => ({ ...f, minQuantity: e.target.value }))
              }
              className={inputBase}
              min={0}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              SL đến
            </span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxQuantity}
              onChange={(e) =>
                setFilters((f) => ({ ...f, maxQuantity: e.target.value }))
              }
              className={inputBase}
              min={0}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            <FiSearch className="h-4 w-4" aria-hidden />
            Áp dụng lọc
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ảnh bìa
                </th>
                <th className="min-w-[180px] px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tên sách
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Thể loại
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Giá
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Giá gốc
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SL
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ĐVT
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hot
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trạng thái
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((b, index) => {
                const imgs = imageList(b);
                const cover = imgs[0];
                const extraCount = Math.max(0, imgs.length - 1);
                return (
                  <tr
                    key={b._id}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 tabular-nums">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="relative inline-flex"
                        title={
                          imgs.length
                            ? `${imgs.length} ảnh — chỉ hiển thị ảnh bìa`
                            : undefined
                        }
                      >
                        <div className="flex h-[52px] w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
                          {cover ? (
                            <img
                              src={imgUrl(cover)}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg text-slate-300">
                              📖
                            </span>
                          )}
                        </div>
                        {extraCount > 0 && (
                          <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-md border border-white bg-slate-800 px-1 text-[10px] font-bold text-white shadow">
                            +{extraCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <span
                        className="line-clamp-2 font-medium text-slate-900"
                        title={b.title}
                      >
                        {b.title}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {b.categoryId?.name ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-slate-900">
                      {Number(b.price).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-500">
                      {b.originalPrice != null
                        ? `${Number(b.originalPrice).toLocaleString('vi-VN')} ₫`
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-700">
                      {b.quantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {b.quantityType === 'set' ? 'Bộ' : 'Cuốn'}
                    </td>
                    <td className="px-4 py-3">
                      {b.isHot ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200/60">
                          <FiStar className="h-3 w-3 fill-amber-400 text-amber-500" />
                          Hot
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                          b.status === 'sold'
                            ? 'bg-slate-100 text-slate-700 ring-slate-200'
                            : b.status === 'out_of_stock'
                              ? 'bg-rose-50 text-rose-800 ring-rose-200/70'
                              : 'bg-emerald-50 text-emerald-800 ring-emerald-200/70'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            b.status === 'sold'
                              ? 'bg-slate-400'
                              : b.status === 'out_of_stock'
                                ? 'bg-rose-500'
                                : 'bg-emerald-500'
                          }`}
                          aria-hidden
                        />
                        {b.status === 'sold'
                          ? 'Đã bán'
                          : b.status === 'out_of_stock'
                            ? 'Hết hàng'
                            : 'Còn hàng'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <IconBtn
                          onClick={() => handleSold(b)}
                          title={
                            b.status === 'sold'
                              ? 'Hoàn tác (còn hàng)'
                              : 'Đánh dấu đã bán'
                          }
                          className={
                            b.status === 'sold'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }
                        >
                          {b.status === 'sold' ? (
                            <FiRotateCcw className="h-4 w-4" />
                          ) : (
                            <FiShoppingBag className="h-4 w-4" />
                          )}
                        </IconBtn>
                        <IconBtn
                          onClick={() => handleToggleHot(b)}
                          title={b.isHot ? 'Bỏ hot' : 'Đánh dấu hot'}
                          className={
                            b.isHot
                              ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                          }
                        >
                          <FiStar
                            className={`h-4 w-4 ${b.isHot ? 'fill-amber-400 text-amber-600' : ''}`}
                          />
                        </IconBtn>
                        <IconBtn
                          onClick={() => navigate(`/books/edit/${b._id}`)}
                          title="Sửa sách"
                          className="border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          onClick={() => handleDelete(b._id)}
                          title="Xóa sách"
                          className="border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              Chưa có sách phù hợp bộ lọc
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Thử đổi điều kiện lọc hoặc{' '}
              <Link
                to="/books/add"
                className="font-medium text-slate-900 underline underline-offset-2 hover:no-underline"
              >
                thêm sách mới
              </Link>
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">
            Trang{' '}
            <span className="font-medium text-slate-900">{page}</span> /{' '}
            <span className="font-medium text-slate-900">{totalPages}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span className="tabular-nums">{total}</span> sách
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <FiChevronLeft className="h-4 w-4" />
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Sau
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
