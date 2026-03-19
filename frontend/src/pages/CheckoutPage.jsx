import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import QRPayment from '../components/QRPayment';
import Seo from '../components/Seo';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cartItems, getTotalPrice, clearCart, updateQuantity, removeItem } = useCartStore();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '', address: '' });
  const [orderCreated, setOrderCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const subtotal = getTotalPrice();
  const shippingFee = paymentMethod === 'cod' ? 25000 : 0;
  const total = subtotal + shippingFee;

  useEffect(() => {
    api.get('/api/bank-accounts').then((res) => setBankAccounts(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setGuestInfo((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleConfirmPayment = async () => {
    if (cartItems.length === 0) {
      setError('Giỏ hàng trống.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const items = cartItems.map((i) => ({
        bookId: i.bookId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      }));
      const body = {
        items,
        total,
        shippingFee,
        paymentMethod,
      };
      if (!user) {
        body.guestInfo = guestInfo;
      }
      const { data } = await api.post('/api/orders', body);
      setOrderCreated(data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo đơn hàng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderCreated) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-gray-500">Giỏ hàng trống. Vui lòng thêm sách vào giỏ.</p>
        <button
          type="button"
          onClick={() => navigate('/sach')}
          className="mt-4 text-green-800 font-medium hover:underline"
        >
          Mua sắm ngay →
        </button>
      </div>
    );
  }

  if (orderCreated) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-lg text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Đã ghi nhận đơn hàng</h1>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn. Đơn hàng của bạn đang chờ xác nhận thanh toán từ cửa hàng.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-lg bg-green-800 text-white font-medium hover:bg-green-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Seo
        title="Thanh toán"
        description="Hoàn tất đơn hàng tại Sách Truyện Mỹ Hạnh với các phương thức thanh toán linh hoạt: QR, COD hoặc giao dịch trực tiếp."
      />
      <h1 className="text-2xl font-bold text-green-800 mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 items-start">
        <div className="space-y-6">
          {!user && (
            <div className="p-4 bg-white rounded-xl shadow-md space-y-3">
              <h2 className="font-bold text-gray-800">Thông tin giao hàng (khách)</h2>
              <input
                type="text"
                placeholder="Họ tên"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={guestInfo.address}
                onChange={(e) => setGuestInfo((p) => ({ ...p, address: e.target.value }))}
                className="w-full rounded-lg border border-green-200 px-3 py-2"
              />
            </div>
          )}

          <div className="p-4 bg-white rounded-xl shadow-md">
            <h2 className="font-bold text-gray-800 mb-3">Phương thức thanh toán</h2>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-green-100 hover:bg-green-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-800">Quét mã QR chuyển khoản</p>
                  <p className="text-sm text-gray-500">Thanh toán trước qua tài khoản ngân hàng.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-green-100 hover:bg-green-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-800">Giao hàng COD</p>
                  <p className="text-sm text-gray-500">Thanh toán khi nhận hàng. Phí ship mặc định 25.000₫.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-green-100 hover:bg-green-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="direct"
                  checked={paymentMethod === 'direct'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-800">Giao dịch trực tiếp</p>
                  <p className="text-sm text-gray-500">Đặt trước và thanh toán trực tiếp tại cửa hàng.</p>
                </div>
              </label>
            </div>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="p-4 bg-white rounded-xl shadow-md">
              <QRPayment bankAccounts={bankAccounts} />
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
              Bạn chọn COD. Đơn hàng sẽ cộng thêm phí giao hàng 25.000₫.
            </div>
          )}

          {paymentMethod === 'direct' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-sm">
              Bạn chọn giao dịch trực tiếp. Cửa hàng sẽ liên hệ để xác nhận thời gian nhận hàng.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : paymentMethod === 'bank_transfer' ? 'Xác nhận đã thanh toán' : 'Đặt đơn hàng'}
          </button>
        </div>

        <aside className="bg-white rounded-xl shadow-md p-4 lg:sticky lg:top-24">
          <h2 className="font-bold text-gray-800 mb-3">Đơn hàng của bạn</h2>
          <ul className="space-y-3 max-h-[50vh] overflow-auto pr-1">
            {cartItems.map((item) => {
              const hasDiscount = Number(item.originalPrice || 0) > Number(item.price || 0);
              const discountPercent = hasDiscount
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : null;
              return (
                <li key={item.bookId} className="flex gap-3 border-b border-green-50 pb-3">
                  <div className="w-16 h-20 bg-green-50 rounded overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
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
                        className="ml-1 text-red-600 text-sm hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-green-100 mt-3 pt-3">
            <div className="space-y-1 text-sm text-gray-700">
              <p className="flex justify-between">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
              </p>
              <p className="flex justify-between">
                <span>Phí giao hàng</span>
                <span>{shippingFee.toLocaleString('vi-VN')}₫</span>
              </p>
            </div>
            <p className="flex justify-between text-lg font-bold text-green-900 mt-2">
              <span>Tổng thanh toán</span>
              <span>{total.toLocaleString('vi-VN')}₫</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
