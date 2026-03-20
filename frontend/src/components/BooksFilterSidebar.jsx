import SearchBar from './SearchBar';

const PRICE_BUCKETS = [
  { id: 'under50', label: 'Giá dưới 50.000₫', min: '', max: '50000' },
  { id: '50-100', label: '50.000₫ - 100.000₫', min: '50000', max: '100000' },
  { id: '100-150', label: '100.000₫ - 150.000₫', min: '100000', max: '150000' },
  { id: '150-200', label: '150.000₫ - 200.000₫', min: '150000', max: '200000' },
  { id: 'over200', label: 'Giá trên 200.000₫', min: '200000', max: '' },
];

function matchPriceBucket(minPrice, maxPrice) {
  const mi = minPrice != null && minPrice !== '' ? String(minPrice) : '';
  const ma = maxPrice != null && maxPrice !== '' ? String(maxPrice) : '';
  const hit = PRICE_BUCKETS.find((b) => (b.min || '') === mi && (b.max || '') === ma);
  return hit?.id ?? null;
}

export default function BooksFilterSidebar({
  search,
  categoryId,
  minPrice,
  maxPrice,
  categories = [],
  onSearch,
  onCategoryChange,
  onPriceRangeChange,
}) {
  const activeBucket = matchPriceBucket(minPrice, maxPrice);

  const toggleBucket = (id) => {
    const b = PRICE_BUCKETS.find((x) => x.id === id);
    if (!b) return;
    if (activeBucket === id) onPriceRangeChange('', '');
    else onPriceRangeChange(b.min, b.max);
  };

  return (
    <aside className="lg:sticky lg:top-24 lg:z-10 self-start">
      <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
        <section className="p-4 border-b border-green-100">
          <h2 className="text-xs font-bold text-green-900 uppercase tracking-wide mb-3">Tìm sách</h2>
          <SearchBar
            fullWidth
            defaultValue={search}
            onSearch={onSearch}
            placeholder="Tìm theo tên sách..."
          />
        </section>

        <section className="p-4 border-b border-green-100">
          <h2 className="text-xs font-bold text-green-900 uppercase tracking-wide mb-3">Danh mục</h2>
          <label htmlFor="books-category" className="sr-only">
            Chọn danh mục
          </label>
          <select
            id="books-category"
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-green-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </section>

        <section className="p-4">
          <h2 className="text-xs font-bold text-green-900 uppercase tracking-wide mb-3">Giá</h2>
          <ul className="space-y-2.5">
            {PRICE_BUCKETS.map((b) => (
              <li key={b.id}>
                <label className="flex items-start gap-2.5 cursor-pointer text-sm text-gray-700 hover:text-green-800 leading-snug">
                  <input
                    type="checkbox"
                    checked={activeBucket === b.id}
                    onChange={() => toggleBucket(b.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-green-300 text-green-700 focus:ring-green-600"
                  />
                  <span>{b.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
