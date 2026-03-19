import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Seo from '../components/Seo';

const STATUS_LABEL = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    api
      .get('/api/orders/my')
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <Seo
        title="Đơn hàng của tôi"
        description="Theo dõi trạng thái và lịch sử đơn hàng của bạn tại Sách Truyện Mỹ Hạnh."
      />
      <h1 className="text-2xl font-bold text-green-800 mb-6">Đơn hàng của tôi</h1>
      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-green-200 rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <p className="font-mono text-sm text-gray-500">#{order._id.slice(-8)}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
              <p className="mt-2 font-bold text-green-900">
                Tổng tiền: {order.total?.toLocaleString('vi-VN')}₫
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                {order.items?.slice(0, 3).map((item, i) => (
                  <li key={i}>
                    {item.title} × {item.quantity}
                  </li>
                ))}
                {order.items?.length > 3 && (
                  <li>... và {order.items.length - 3} sản phẩm khác</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
