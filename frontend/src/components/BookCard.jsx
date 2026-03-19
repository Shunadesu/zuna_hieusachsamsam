import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';

export default function BookCard({ book, originalPrice, discountPrice }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const showToast = useToastStore((s) => s.show);
  const displayPrice = discountPrice != null ? discountPrice : book.price;
  const hasDiscount = originalPrice != null && originalPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : null;
  const pricingBook = { ...book, price: displayPrice, originalPrice: hasDiscount ? originalPrice : null };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(pricingBook, 1);
    showToast('Đã thêm vào giỏ');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    clearCart();
    addItem(pricingBook, 1);
    navigate('/thanh-toan');
  };

  return (
    <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
      <Link to={`/sach/${book.slug}`} className="block flex-1">
        <div className="aspect-[3/4] bg-green-50 overflow-hidden">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-green-300 text-4xl">
              📖
            </div>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="text-base font-semibold text-green-800 line-clamp-2">{book.title}</h3>
          <div className="mt-2 min-h-[48px]">
            <span className="text-green-800 font-bold block">
              {displayPrice.toLocaleString('vi-VN')}₫
            </span>
            <div className="mt-0.5 flex items-center gap-2">
              <span className={`text-sm line-through ${hasDiscount ? 'text-gray-400' : 'text-transparent'}`}>
                {hasDiscount ? `${originalPrice?.toLocaleString('vi-VN')}₫` : '0₫'}
              </span>
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
        </div>
      </Link>
      <div className="p-3 pt-0 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
        >
          Thêm giỏ
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}
