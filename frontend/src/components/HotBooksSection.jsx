import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { FaShoppingCart, FaBolt } from 'react-icons/fa';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import 'swiper/css';
import 'swiper/css/navigation';

const FLASHSALE_HOT_ICON =
  'https://bizweb.dktcdn.net/100/496/744/themes/922464/assets/flashsale-hot.png?1746670709210';

function calcDiscountPercent(book) {
  const original = Number(book.originalPrice || 0);
  const price = Number(book.price || 0);
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

function HotBookCard({ book }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const showToast = useToastStore((s) => s.show);
  const discount = calcDiscountPercent(book);

  const handleAddToCart = () => {
    addItem(book, 1);
    showToast('Đã thêm vào giỏ');
  };

  const handleBuyNow = () => {
    clearCart();
    addItem(book, 1);
    navigate('/thanh-toan');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <Link to={`/sach/${book.slug}`} className="block shrink-0">
        <div className="aspect-[3/4] bg-green-50">
          {book.image ? (
            <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-green-700">📚</div>
          )}
        </div>
      </Link>
      <div className="p-2 sm:p-3 flex-1 flex flex-col min-h-0">
        <Link
          to={`/sach/${book.slug}`}
          className="block text-sm text-gray-800 line-clamp-1 min-w-0 hover:text-green-800"
          title={book.title}
        >
          {book.title}
        </Link>

        <div className="mt-2 shrink-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-green-700 font-bold text-sm sm:text-base">
              {Number(book.price).toLocaleString('vi-VN')}₫
            </span>
            {discount != null ? (
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium shrink-0">
                -{discount}%
              </span>
            ) : null}
          </div>
          {book.originalPrice ? (
            <div className="text-gray-400 text-xs sm:text-sm line-through">
              {Number(book.originalPrice).toLocaleString('vi-VN')}₫
            </div>
          ) : null}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label="Thêm vào giỏ"
            className="w-full py-2 sm:py-2 rounded-md sm:rounded-lg bg-green-600 text-white text-xs sm:text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1.5"
          >
            <FaShoppingCart className="w-[1.125rem] h-[1.125rem] md:hidden shrink-0" aria-hidden />
            <span className="hidden md:inline">Thêm vào giỏ</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            aria-label="Mua ngay"
            className="w-full py-2 sm:py-2 rounded-md sm:rounded-lg bg-amber-500 text-white text-xs sm:text-sm font-medium hover:bg-amber-600 transition flex items-center justify-center gap-1.5"
          >
            <FaBolt className="w-[1.125rem] h-[1.125rem] md:hidden shrink-0" aria-hidden />
            <span className="hidden md:inline">Mua ngay</span>
          </button>
        </div>

        <div className="mt-auto pt-2 shrink-0">
          <span className="inline-flex items-center gap-0.5 text-xs px-2 py-1 rounded bg-red-100 text-red-600 font-medium w-full justify-center sm:justify-start">
            <span aria-hidden>⚡</span>
            Sắp cháy hàng
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HotBooksSection({ books = [] }) {
  if (!books.length) return null;

  return (
    <section className="mb-8 rounded-xl bg-green-800 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <img
            src={FLASHSALE_HOT_ICON}
            alt=""
            width={33}
            height={15}
            className="h-5 w-auto sm:h-6 object-contain shrink-0 drop-shadow-sm"
            loading="lazy"
            decoding="async"
          />
          <h2 className="text-white font-bold text-lg sm:text-xl tracking-tight">GIẢM SỐC</h2>
        </div>
      </div>

      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={books.length > 4}
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{
          768: { slidesPerView: 4 },
        }}
      >
        {books.map((book) => (
          <SwiperSlide key={book._id}>
            <HotBookCard book={book} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
