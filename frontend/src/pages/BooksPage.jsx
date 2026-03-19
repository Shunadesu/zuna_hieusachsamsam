import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApiStore } from '../store/apiStore';
import BookGrid from '../components/BookGrid';
import SearchBar from '../components/SearchBar';
import Seo from '../components/Seo';

const LIMIT = 12;

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [total, setTotal] = useState(0);
  const { books, categories, promotions, fetchBooks, fetchCategories, fetchPromotions, loading } =
    useApiStore();

  useEffect(() => {
    fetchCategories().catch(() => {});
    fetchPromotions().catch(() => {});
  }, [fetchCategories, fetchPromotions]);

  useEffect(() => {
    const params = {
      page,
      limit: LIMIT,
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
    };
    fetchBooks(params)
      .then((res) => setTotal(res?.total ?? 0))
      .catch(() => setTotal(0));
  }, [page, search, categoryId, minPrice, maxPrice, fetchBooks]);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const handleSearch = (q) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (q) next.set('search', q);
      else next.delete('search');
      next.delete('page');
      return next;
    });
  };

  const handleFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Seo
        title="Danh sách sách"
        description="Khám phá danh sách sách truyện tại Sách Truyện Mỹ Hạnh, lọc theo danh mục và mức giá phù hợp."
      />
      {/* <h1 className="text-2xl font-bold text-green-800 mb-6">Sách</h1> */}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            defaultValue={search}
            onSearch={handleSearch}
            placeholder="Tìm theo tên sách..."
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={categoryId}
            onChange={(e) => handleFilter('categoryId', e.target.value)}
            className="rounded-lg border border-green-200 px-3 py-2 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {(categories || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Giá tối thiểu"
            value={minPrice}
            onChange={(e) => handleFilter('minPrice', e.target.value)}
            className="w-28 rounded-lg border border-green-200 px-2 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Giá tối đa"
            value={maxPrice}
            onChange={(e) => handleFilter('maxPrice', e.target.value)}
            className="w-28 rounded-lg border border-green-200 px-2 py-2 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : books?.length ? (
        <>
          <BookGrid books={books} promotions={promotions} />
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(page - 1));
                  setSearchParams(next);
                }}
                className="px-4 py-2 rounded-lg border border-green-200 disabled:opacity-50 hover:bg-green-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(page + 1));
                  setSearchParams(next);
                }}
                className="px-4 py-2 rounded-lg border border-green-200 disabled:opacity-50 hover:bg-green-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">Không tìm thấy sách.</p>
      )}
    </div>
  );
}
