import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function calcDiscountPercent(book) {
  const original = Number(book.originalPrice || 0);
  const price = Number(book.price || 0);
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

export default function HotBooksSection({ books = [] }) {
  if (!books.length) return null;

  return (
    <section className="mb-8 rounded-xl bg-green-800 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-lg sm:text-xl">GIẢM SỐC</h2>
      </div>

      <Swiper
        modules={[Autoplay]}
        // navigation
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={books.length > 4}
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{
          768: { slidesPerView: 4 },
        }}
      >
        {books.map((book) => {
          const discount = calcDiscountPercent(book);
          return (
            <SwiperSlide key={book._id}>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
                <Link to={`/sach/${book.slug}`} className="block">
                  <div className="aspect-[3/4] bg-green-50">
                    {book.image ? (
                      <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-green-700">📚</div>
                    )}
                  </div>
                </Link>
                <div className="p-2 sm:p-3 flex-1 flex flex-col">
                  <Link to={`/sach/${book.slug}`} className="text-sm text-gray-800 line-clamp-2 hover:text-green-800">
                    {book.title}
                  </Link>
                  <div className="mt-2">
                    <div className="text-green-700 font-bold">{Number(book.price).toLocaleString('vi-VN')}₫</div>
                    {book.originalPrice ? (
                      <div className="text-gray-400 text-sm line-through">
                        {Number(book.originalPrice).toLocaleString('vi-VN')}₫
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {discount ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                        -{discount}%
                      </span>
                    ) : null}
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                      ⚡ Sắp cháy hàng
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

