import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer({ open, onClose }) {
  const { cartItems, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-green-100">
          <h2 className="text-lg font-bold text-green-800">Giỏ hàng</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500" aria-label="Đóng">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Giỏ hàng trống.</p>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li key={item.bookId} className="flex gap-3 border-b border-green-50 pb-3">
                  <div className="w-16 h-20 bg-green-50 rounded overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {(() => {
                      const hasDiscount = Number(item.originalPrice || 0) > Number(item.price || 0);
                      const discountPercent = hasDiscount
                        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                        : null;
                      return (
                        <>
                    <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.title}</p>
                    <p className="text-green-800 font-bold text-sm">
                      {item.price.toLocaleString('vi-VN')}₫
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 min-h-[18px]">
                      <span className={`text-xs line-through ${hasDiscount ? 'text-gray-400' : 'text-transparent'}`}>
                        {hasDiscount ? `${Number(item.originalPrice).toLocaleString('vi-VN')}₫` : '0₫'}
                      </span>
                      {discountPercent ? (
                        <span className="inline-flex items-center px-1 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100">
                          -{discountPercent}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-semibold border border-transparent text-transparent">
                          -0%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        className="w-7 h-7 rounded border border-green-200 text-green-800 hover:bg-green-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        className="w-7 h-7 rounded border border-green-200 text-green-800 hover:bg-green-50"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.bookId)}
                        className="ml-2 text-red-600 text-sm hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                        </>
                      );
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t border-green-100">
          <p className="flex justify-between text-lg font-bold text-green-900 mb-3">
            <span>Tổng tiền</span>
            <span>{total.toLocaleString('vi-VN')}₫</span>
          </p>
          <Link
            to="/gio-hang"
            onClick={onClose}
            className="block w-full py-2 text-center rounded-lg bg-green-800 text-white font-medium hover:bg-green-700 mb-2"
          >
            Xem giỏ hàng
          </Link>
          <Link
            to="/thanh-toan"
            onClick={onClose}
            className="block w-full py-2 text-center rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </>
  );
}
