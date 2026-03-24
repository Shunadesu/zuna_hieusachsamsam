import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useApiStore } from '../store/apiStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import BookGrid from '../components/BookGrid';
import api from '../services/api';
import Seo from '../components/Seo';

export default function BookDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { bookDetail, promotions, fetchBookDetail, fetchPromotions, loading, error } = useApiStore();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const showToast = useToastStore((s) => s.show);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [similarBooks, setSimilarBooks] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  useEffect(() => {
    if (slug) fetchBookDetail(slug).catch(() => {});
    fetchPromotions().catch(() => {});
  }, [slug, fetchBookDetail, fetchPromotions]);

  const now = new Date();
  const activePromo = (promotions || []).find((p) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now <= end && (p.bookIds || []).some((b) => b._id === bookDetail?._id);
  });

  let displayPrice = Number(bookDetail?.price ?? 0);
  let originalPrice = null;
  let promoLabel = '';

  if (bookDetail) {
    const baseOriginal = Number(bookDetail.originalPrice || 0);
    if (baseOriginal > displayPrice) {
      originalPrice = baseOriginal;
      promoLabel = `Giảm ${Math.round(((baseOriginal - displayPrice) / baseOriginal) * 100)}%`;
    }
  }

  if (activePromo && bookDetail) {
    const promoBasePrice = Number(bookDetail.price || 0);
    originalPrice = promoBasePrice;
    if (activePromo.type === 'percent') {
      displayPrice = Math.round(promoBasePrice * (1 - activePromo.value / 100));
      promoLabel = `Giảm ${activePromo.value}%`;
    } else if (activePromo.type === 'fixed') {
      displayPrice = Math.max(0, promoBasePrice - activePromo.value);
      promoLabel = `Giảm ${activePromo.value.toLocaleString('vi-VN')}₫`;
    }
  }

  const saving = originalPrice != null ? Math.max(0, originalPrice - displayPrice) : 0;
  const stockCount = Number(bookDetail?.quantity || 0);
  const inStock = bookDetail?.status !== 'out_of_stock' && stockCount > 0;
  const stockText = inStock ? `Còn ${stockCount} cuốn` : 'Tạm hết hàng';
  const allImages = Array.from(
    new Set([...(Array.isArray(bookDetail?.images) ? bookDetail.images : []), bookDetail?.image].filter(Boolean))
  );
  const firstImage = allImages[0] || '';

  useEffect(() => {
    setSelectedImage(firstImage);
  }, [firstImage, bookDetail?._id]);

  useEffect(() => {
    const categoryId =
      typeof bookDetail?.categoryId === 'object' ? bookDetail?.categoryId?._id : bookDetail?.categoryId;
    if (!categoryId || !bookDetail?._id) {
      setSimilarBooks([]);
      return;
    }

    let cancelled = false;
    setSimilarLoading(true);
    api
      .get('/api/books', { params: { categoryId, limit: 12, page: 1 } })
      .then(({ data }) => {
        if (cancelled) return;
        const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://hieusachsamsam.store').replace(/\/$/, '');
        const toAbsoluteUrl = (value) => {
          if (!value || typeof value !== 'string') return value;
          if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
            return value;
          }
          if (value.startsWith('/')) return `${API_ORIGIN}${value}`;
          return `${API_ORIGIN}/${value}`;
        };
        const normalizeBook = (book) => {
          if (!book || typeof book !== 'object') return book;
          const normalizedImages = Array.isArray(book.images) ? book.images.map((img) => toAbsoluteUrl(img)) : book.images;
          return {
            ...book,
            image: toAbsoluteUrl(book.image),
            images: normalizedImages,
          };
        };
        const rows = data?.data || [];
        setSimilarBooks(rows.filter((b) => b._id !== bookDetail._id).slice(0, 10).map(normalizeBook));
      })
      .catch(() => {
        if (!cancelled) setSimilarBooks([]);
      })
      .finally(() => {
        if (!cancelled) setSimilarLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookDetail?._id, bookDetail?.categoryId]);

  const handleAddToCart = () => {
    if (!bookDetail) return;
    addItem(
      {
        ...bookDetail,
        price: displayPrice,
        originalPrice: originalPrice || null,
        image: firstImage || bookDetail?.image,
      },
      1
    );
    showToast('Đã thêm vào giỏ');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!bookDetail || !inStock) return;
    clearCart();
    addItem(
      {
        ...bookDetail,
        price: displayPrice,
        originalPrice: originalPrice || null,
        image: firstImage || bookDetail?.image,
      },
      1
    );
    navigate('/thanh-toan');
  };

  if (loading && !bookDetail) {
    return (
      <div className="container mx-auto px-4 py-5 md:py-6 animate-pulse">
        <div className="h-4 w-52 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-36 bg-gray-200 rounded mb-5" />
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,420px),1fr] gap-6 lg:gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
            <div className="mt-2.5 flex gap-2">
              <div className="w-[74px] h-[74px] rounded-md bg-gray-200" />
              <div className="w-[74px] h-[74px] rounded-md bg-gray-200" />
              <div className="w-[74px] h-[74px] rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="h-8 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
            <div className="h-20 bg-gray-200 rounded-lg mb-4" />
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="h-16 bg-gray-200 rounded-lg" />
              <div className="h-16 bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2 mb-5">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-11/12" />
              <div className="h-4 bg-gray-200 rounded w-10/12" />
            </div>
            <div className="flex gap-2.5">
              <div className="h-10 w-28 bg-gray-200 rounded-lg" />
              <div className="h-10 w-24 bg-gray-200 rounded-lg" />
              <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !bookDetail)
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-red-600">Không tìm thấy sách.</p>
        <Link to="/sach" className="text-green-800 mt-2 inline-block">
          ← Quay lại danh sách
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-5 md:py-6">
      <Seo
        title={bookDetail?.title || 'Chi tiết sách'}
        description={
          bookDetail?.description
            ? String(bookDetail.description).slice(0, 160)
            : `Chi tiết sách ${bookDetail?.title || ''} tại Sách Truyện Mỹ Hạnh.`
        }
      />
      <div className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/sach" className="hover:text-green-700">Sách</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{bookDetail.title}</span>
      </div>

      <Link to="/sach" className="text-green-800 text-sm mb-4 inline-block hover:underline">
        ← Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,420px),1fr] gap-6 lg:gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2.5 md:p-3">
          <div className="aspect-[3/4] bg-green-50 rounded-lg overflow-hidden">
            {selectedImage || firstImage ? (
              <img
                src={selectedImage || firstImage}
                alt={bookDetail.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📖</div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-2.5">
              <Swiper spaceBetween={8} slidesPerView={'auto'}>
                {allImages.map((img, idx) => {
                  const active = (selectedImage || firstImage) === img;
                  return (
                    <SwiperSlide key={`${img}-${idx}`} style={{ width: '74px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`w-[74px] h-[74px] overflow-hidden rounded-md border-2 ${
                          active ? 'border-green-600' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt={`${bookDetail.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {bookDetail.categoryId?.name && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800 border border-green-100">
                {bookDetail.categoryId.name}
              </span>
            )}
            {promoLabel && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                {promoLabel}
              </span>
            )}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                inStock
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {stockText}
            </span>
          </div>

          <h1 className="text-2xl md:text-[28px] font-bold text-gray-800 leading-tight">{bookDetail.title}</h1>
          {bookDetail.categoryId && (
            <p className="text-gray-500 text-sm mt-1">Danh mục: {bookDetail.categoryId.name}</p>
          )}

          <div className="mt-4 p-3.5 rounded-lg bg-green-50/70 border border-green-100">
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl font-bold text-green-800">
                {displayPrice.toLocaleString('vi-VN')}₫
              </span>
              {originalPrice != null && (
                <span className="text-gray-400 line-through text-lg">
                  {originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            {saving > 0 && (
              <p className="text-sm text-green-700 mt-1">
                Tiết kiệm {saving.toLocaleString('vi-VN')}₫
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 text-sm">
            <div className="rounded-lg border border-gray-200 px-3 py-2">
              <p className="text-gray-500">Tình trạng</p>
              <p className="font-medium text-gray-800">{inStock ? 'Sẵn hàng' : 'Hết hàng'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 px-3 py-2">
              <p className="text-gray-500">Số lượng hiện có</p>
              <p className="font-medium text-gray-800">{stockCount} cuốn</p>
            </div>
          </div>

          {bookDetail.description && (
            <div className="mt-6">
              <h2 className="text-base font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h2>
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">{bookDetail.description}</div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2.5 items-center">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {added ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="px-5 py-2.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Mua ngay
            </button>
            <Link
              to="/sach"
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              Xem sách khác
            </Link>
          </div>

          <div className="mt-5 text-xs text-gray-500 space-y-1">
            <p>Cam kết sách đúng mô tả.</p>
            <p>Hỗ trợ tư vấn và kiểm tra đơn trước khi giao.</p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-green-800">Sách tương tự</h2>
          {bookDetail.categoryId?.slug && (
            <Link
              to={`/sach?category=${bookDetail.categoryId.slug}`}
              className="text-sm text-green-800 hover:text-green-700 font-medium"
            >
              Xem thêm →
            </Link>
          )}
        </div>

        {similarLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : similarBooks.length > 0 ? (
          <BookGrid books={similarBooks} promotions={promotions || []} />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
            Chưa có sách tương tự trong danh mục này.
          </div>
        )}
      </section>
    </div>
  );
}
