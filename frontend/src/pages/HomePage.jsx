import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useApiStore } from "../store/apiStore";
import { useCartStore } from "../store/cartStore";
import { useHomeHeroStore } from "../store/homeHeroStore";
import { useToastStore } from "../store/toastStore";
import SliderBanner from "../components/SliderBanner";
import BelowSliderBanners from "../components/BelowSliderBanners";
import BookGrid from "../components/BookGrid";
import HotBooksSection from "../components/HotBooksSection";
import HomeHeroSkeleton from "../components/HomeHeroSkeleton";
import HomeCategoryStripSkeleton from "../components/HomeCategoryStripSkeleton";
import Seo from "../components/Seo";
import { bookPathSlug } from "../utils/slugify";
import {
  FaTruck,
  FaRecycle,
  FaListUl,
  FaShoppingCart,
  FaBolt,
} from "react-icons/fa";

export default function HomePage() {
  const navigate = useNavigate();
  const {
    books,
    hotBooks,
    categories,
    promotions,
    sliders,
    fetchBooks,
    fetchHotBooks,
    fetchCategories,
    fetchPromotions,
    fetchSliders,
  } = useApiStore();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const showToast = useToastStore((s) => s.show);
  const heroDataReady = useHomeHeroStore((s) => s.heroDataReady);
  const categoryStripReady = useHomeHeroStore((s) => s.categoryStripReady);
  const setHeroDataReady = useHomeHeroStore((s) => s.setHeroDataReady);
  const setCategoryStripReady = useHomeHeroStore(
    (s) => s.setCategoryStripReady,
  );
  const resetHomeHero = useHomeHeroStore((s) => s.resetHomeHero);

  useEffect(() => {
    fetchBooks({ limit: 120 }).catch(() => {});
    fetchHotBooks(12).catch(() => {});
    fetchPromotions().catch(() => {});

    let cancelled = false;
    const categoriesPromise = fetchCategories().catch(() => {});
    categoriesPromise.finally(() => {
      if (!cancelled) setCategoryStripReady(true);
    });
    Promise.all([categoriesPromise, fetchSliders().catch(() => {})]).finally(
      () => {
        if (!cancelled) setHeroDataReady(true);
      },
    );
    return () => {
      cancelled = true;
      resetHomeHero();
    };
  }, [
    fetchBooks,
    fetchHotBooks,
    fetchCategories,
    fetchPromotions,
    fetchSliders,
    setHeroDataReady,
    setCategoryStripReady,
    resetHomeHero,
  ]);

  const now = new Date();
  const activePromotions = useMemo(
    () =>
      (promotions || []).filter((p) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        return now >= start && now <= end;
      }),
    [promotions],
  );
  const promoBookIds = useMemo(
    () =>
      new Set(
        activePromotions.flatMap((p) =>
          (p.bookIds || []).map((b) => (typeof b === "object" ? b._id : b)),
        ),
      ),
    [activePromotions],
  );
  const promoBooks = useMemo(
    () => (books || []).filter((b) => promoBookIds.has(b._id)),
    [books, promoBookIds],
  );
  const topCategories = useMemo(
    () => (categories || []).slice(0, 6),
    [categories],
  );
  const categorySections = useMemo(
    () =>
      topCategories.map((cat) => {
        const categoryBooks = (books || []).filter((b) => {
          const cid =
            typeof b.categoryId === "object" ? b.categoryId?._id : b.categoryId;
          return cid === cat._id;
        });
        return { category: cat, books: categoryBooks.slice(0, 8) };
      }),
    [topCategories, books],
  );

  const getActivePromotionForBook = (bookId) =>
    activePromotions.find((p) =>
      (p.bookIds || []).some(
        (b) => (typeof b === "object" ? b._id : b) === bookId,
      ),
    );

  const getBookPriceInfo = (book) => {
    const promo = getActivePromotionForBook(book._id);
    const basePrice = Number(book.price || 0);
    let salePrice = basePrice;
    if (promo?.type === "percent")
      salePrice = Math.round(basePrice * (1 - Number(promo.value || 0) / 100));
    if (promo?.type === "fixed")
      salePrice = Math.max(0, basePrice - Number(promo.value || 0));

    const originalPrice = Number(book.originalPrice || 0);
    if (originalPrice > salePrice) {
      return { salePrice, originalPrice };
    }
    if (basePrice > salePrice) {
      return { salePrice, originalPrice: basePrice };
    }
    return { salePrice, originalPrice: null };
  };

  const handleAddToCart = (book) => {
    const { salePrice, originalPrice } = getBookPriceInfo(book);
    addItem(
      { ...book, price: salePrice, originalPrice: originalPrice || null },
      1,
    );
    showToast("Đã thêm vào giỏ");
  };

  const handleBuyNow = (book) => {
    const { salePrice, originalPrice } = getBookPriceInfo(book);
    clearCart();
    addItem(
      { ...book, price: salePrice, originalPrice: originalPrice || null },
      1,
    );
    navigate("/thanh-toan");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Seo
        title="Mua bán sách cũ, truyện tranh xưa 199x, sách trước 1975"
        description="Sách Truyện Mỹ Hạnh - thu mua, bán sách truyện cũ toàn quốc với nhiều danh mục và ưu đãi mỗi ngày."
      />
      <section className="mb-8">
        {!heroDataReady ? (
          <HomeHeroSkeleton />
        ) : (
          <div className="lg:grid flex flex-col-reverse lg:grid-cols-10 gap-6 items-stretch">
            {/* LEFT: category sidebar (3/10) */}
            <aside className="lg:col-span-3 order-1">
              <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden h-full flex flex-col">
                <div className="bg-green-700 text-white px-4 py-3 flex items-center gap-2">
                  <FaListUl className="w-4 h-4" aria-hidden="true" />
                  <h2 className="font-bold">Danh mục sách</h2>
                </div>
                <div className="divide-y divide-green-50 flex-1 overflow-auto">
                  {(categories || []).map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/sach?category=${cat.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-green-900 hover:bg-green-50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-green-100 overflow-hidden shrink-0 border border-green-200">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-green-700 text-xs">
                              📚
                            </div>
                          )}
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-green-700">›</span>
                    </Link>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <div className="px-4 py-6 text-sm text-gray-500">
                      Chưa có danh mục.
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* RIGHT: info boxes + slider (7/10) */}
            <div className="lg:col-span-7 order-2 space-y-4 h-full flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/ban-sach"
                  className="bg-white rounded-xl shadow-sm border border-green-100 p-4 hover:shadow-md transition flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-800 text-white flex items-center justify-center shrink-0">
                    <FaRecycle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-green-900">
                      Bạn cần thanh lý sách cũ?
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      Gửi thông tin để cửa hàng liên hệ nhanh.
                    </p>
                  </div>
                </Link>
                <Link
                  to="/"
                  className="bg-white rounded-xl shadow-sm border border-green-100 p-4 hover:shadow-md transition flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-800 text-white flex items-center justify-center shrink-0">
                    <FaTruck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-green-900">
                      Chính sách vận chuyển
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      Giao hàng nhanh, hỗ trợ toàn quốc.
                    </p>
                  </div>
                </Link>
              </div>
              <div className="flex-1">
                <SliderBanner />
              </div>
              <BelowSliderBanners sliders={sliders} />
            </div>
          </div>
        )}
      </section>

      {(!categoryStripReady || (categories?.length ?? 0) > 0) && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">
            Thư mục sách
          </h2>
          {!categoryStripReady ? (
            <HomeCategoryStripSkeleton />
          ) : (
            <div className="bg-white rounded-xl border border-green-100 shadow-sm px-4 py-5">
              <div className="flex gap-5 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/sach?category=${cat.slug}`}
                    className="min-w-[90px] flex flex-col items-center text-center group"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-green-200 bg-green-50 shadow-sm group-hover:shadow-md transition">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-green-700">
                          📚
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-700 leading-tight line-clamp-2">
                      {cat.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <HotBooksSection books={hotBooks} />

      {categorySections.map(({ category, books: categoryBooks }) => (
        <section key={category._id} className="mb-8">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-200 bg-green-50 shrink-0">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-700 text-sm">
                    📚
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-green-800 truncate">
                {category.name}
              </h2>
            </div>
            <Link
              to={`/sach?category=${category.slug}`}
              className="text-sm text-green-800 hover:text-green-700 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          {categoryBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryBooks.map((book) => {
                const { salePrice, originalPrice } = getBookPriceInfo(book);
                const discountPercent =
                  originalPrice && originalPrice > salePrice
                    ? Math.round(
                        ((originalPrice - salePrice) / originalPrice) * 100,
                      )
                    : null;
                return (
                  <div
                    key={book._id}
                    className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    <Link to={`/sach/${bookPathSlug(book)}`} className="block">
                      <div className="aspect-[3/4] bg-green-50">
                        {book.image ? (
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl text-green-700">
                            📚
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-3 min-w-0">
                      <Link
                        to={`/sach/${bookPathSlug(book)}`}
                        className="block text-base font-semibold text-green-800 line-clamp-1 min-w-0 hover:text-green-700"
                        title={book.title}
                      >
                        {book.title}
                      </Link>
                      <div className="mt-2 min-h-[48px]">
                        <div className="text-green-700 font-bold text-base">
                          {salePrice.toLocaleString("vi-VN")}₫
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <div
                            className={`text-sm line-through ${originalPrice != null ? "text-gray-400" : "text-transparent"}`}
                          >
                            {originalPrice != null
                              ? `${originalPrice.toLocaleString("vi-VN")}₫`
                              : "0₫"}
                          </div>
                          {discountPercent ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                              -{discountPercent}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold border border-transparent text-transparent">
                              -0%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(book)}
                          aria-label="Thêm vào giỏ"
                          className="py-2 rounded-lg bg-green-600 text-white text-xs md:text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1.5"
                        >
                          <FaShoppingCart
                            className="w-[1.125rem] h-[1.125rem] md:hidden shrink-0"
                            aria-hidden
                          />
                          <span className="hidden md:inline">Thêm giỏ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBuyNow(book)}
                          aria-label="Mua ngay"
                          className="py-2 rounded-lg bg-amber-500 text-white text-xs md:text-sm font-medium hover:bg-amber-600 transition flex items-center justify-center gap-1.5"
                        >
                          <FaBolt
                            className="w-[1.125rem] h-[1.125rem] md:hidden shrink-0"
                            aria-hidden
                          />
                          <span className="hidden md:inline">Mua ngay</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-green-100 rounded-xl p-4 text-sm text-gray-500">
              Chưa có sách trong danh mục này.
            </div>
          )}
        </section>
      ))}

      {activePromotions.length > 0 && promoBooks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Sách khuyến mãi
          </h2>
          <BookGrid books={promoBooks} promotions={promotions} />
        </section>
      )}
    </div>
  );
}
