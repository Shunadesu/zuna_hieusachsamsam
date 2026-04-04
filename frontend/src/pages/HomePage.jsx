import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApiStore } from "../store/apiStore";
import { useHomeHeroStore } from "../store/homeHeroStore";
import SliderBanner from "../components/SliderBanner";
import BelowSliderBanners from "../components/BelowSliderBanners";
import BookGrid from "../components/BookGrid";
import HotBooksSection from "../components/HotBooksSection";
import HomeHeroSkeleton from "../components/HomeHeroSkeleton";
import HomeCategoryStripSkeleton from "../components/HomeCategoryStripSkeleton";
import Seo from "../components/Seo";
import { FaTruck, FaRecycle, FaListUl, FaChevronRight } from "react-icons/fa";

export default function HomePage() {
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

  // Active promo with discount info
  const featuredPromo = useMemo(() => {
    if (activePromotions.length === 0) return null;
    const top = activePromotions[0];
    return {
      ...top,
      discountText: top.discountType === 'percent'
        ? `Giảm ${top.discountValue}%`
        : `Giảm ${Number(top.discountValue || 0).toLocaleString('vi-VN')}K`,
    };
  }, [activePromotions]);

  return (
    <div className="container mx-auto px-4 py-6">
      <Seo
        title="Mua bán sách cũ, truyện tranh xưa 199x, sách trước 1975"
        description="Sách Truyện Mỹ Hạnh - thu mua, bán sách truyện cũ toàn quốc với nhiều danh mục và ưu đãi mỗi ngày."
      />

      {/* Main hero: category sidebar + slider */}
      <section className="mb-8">
        {!heroDataReady ? (
          <HomeHeroSkeleton />
        ) : (
          <div className="lg:grid flex flex-col-reverse lg:grid-cols-10 gap-5 items-stretch">
            {/* LEFT: category sidebar (3/10) */}
            <aside className="lg:col-span-3 order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden h-full flex flex-col">
                {/* Sidebar header */}
                <div className="bg-green-700 text-white px-4 py-3 flex items-center gap-2.5">
                  <FaListUl className="w-4 h-4" aria-hidden="true" />
                  <h2 className="font-bold text-sm">Danh mục sách</h2>
                </div>

                {/* Quick actions */}
                <div className="px-3 py-2.5 border-b border-green-50 space-y-2">
                  <Link
                    to="/ban-sach"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-green-50/80 hover:bg-green-100 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center shrink-0">
                      <FaRecycle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-green-900 leading-tight">Thanh lý sách cũ?</p>
                      <p className="text-[11px] text-green-700 leading-tight">Gửi thông tin, chúng tôi liên hệ ngay</p>
                    </div>
                    <FaChevronRight className="w-3.5 h-3.5 text-green-600 shrink-0 ml-auto group-hover:translate-x-0.5 transition" />
                  </Link>
                  <Link
                    to="/lien-he"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-green-50/80 hover:bg-green-100 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center shrink-0">
                      <FaTruck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-green-900 leading-tight">Chính sách vận chuyển</p>
                      <p className="text-[11px] text-green-700 leading-tight">Giao hàng nhanh, toàn quốc</p>
                    </div>
                    <FaChevronRight className="w-3.5 h-3.5 text-green-600 shrink-0 ml-auto group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>

                {/* Category list */}
                <div className="divide-y divide-green-50 flex-1 overflow-auto max-h-[420px]">
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
                    <div className="px-4 py-6 text-sm text-gray-500 text-center">
                      Chưa có danh mục.
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* RIGHT: promo banner + slider + below banners (7/10) */}
            <div className="lg:col-span-7 order-2 space-y-4 h-full flex flex-col">
              {/* Promo banner */}
              {featuredPromo && (
                <Link
                  to="/khuyen-mai"
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 to-green-900 p-5 shadow-sm flex items-center gap-4"
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-12 w-24 h-24 bg-white rounded-full translate-y-1/2" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        🔥 Khuyến mãi
                      </span>
                      {featuredPromo.name && (
                        <span className="text-white/80 text-xs truncate">{featuredPromo.name}</span>
                      )}
                    </div>
                    <p className="text-white font-bold text-lg leading-tight mb-0.5">
                      {featuredPromo.discountText}
                    </p>
                    {featuredPromo.endDate && (
                      <p className="text-white/60 text-xs">
                        Hết hạn: {new Date(featuredPromo.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div className="relative flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-white text-sm font-medium backdrop-blur-sm group-hover:bg-white/25 transition">
                    Xem ngay
                    <FaChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              )}

              {/* Slider */}
              <div className="flex-1">
                <SliderBanner />
              </div>

              {/* Below banners */}
              <BelowSliderBanners sliders={sliders} />
            </div>
          </div>
        )}
      </section>

      {/* Hot books */}
      <HotBooksSection books={hotBooks} />

      {/* Category books */}
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
              className="flex items-center gap-1 text-sm text-green-800 hover:text-green-700 font-medium transition"
            >
              Xem tất cả <FaChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {categoryBooks.length > 0 ? (
            <BookGrid
              books={categoryBooks}
              promotions={promotions}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            />
          ) : (
            <div className="bg-white border border-green-100 rounded-xl p-4 text-sm text-gray-500">
              Chưa có sách trong danh mục này.
            </div>
          )}
        </section>
      ))}

      {/* Promotion section */}
      {activePromotions.length > 0 && promoBooks.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 text-lg">
              🎁
            </div>
            <h2 className="text-xl font-bold text-red-600">
              Sách khuyến mãi
            </h2>
          </div>
          <BookGrid books={promoBooks} promotions={promotions} />
        </section>
      )}

      {/* All books CTA */}
      {books && books.length > 0 && (
        <section className="mb-8 text-center">
          <Link
            to="/sach"
            className="inline-flex items-center gap-2 rounded-2xl bg-green-800 text-white px-8 py-4 text-base font-bold shadow-sm hover:bg-green-700 transition"
          >
            Xem tất cả sách ({books.length})
            <FaChevronRight className="w-4 h-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
