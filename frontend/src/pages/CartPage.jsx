import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import Seo from "../components/Seo";

export default function CartPage() {
  const { cartItems, soldBookIds, removeItem, getTotalPrice, updateQuantity } =
    useCartStore();

  const soldIds = new Set(soldBookIds);
  const validItems = cartItems.filter((i) => !soldIds.has(i.bookId));
  const soldItems = cartItems.filter((i) => soldIds.has(i.bookId));
  const total = validItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <Seo
        title="Giỏ hàng"
        description="Xem giỏ hàng của bạn, cập nhật số lượng và tiến hành thanh toán nhanh tại Sách Truyện Mỹ Hạnh."
      />
      <h1 className="text-2xl font-bold text-green-800 mb-6">Giỏ hàng</h1>

      {soldItems.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <p className="font-medium mb-1">
            {soldItems.length} sách trong giỏ đã được bán và không thể đặt:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {soldItems.map((item) => (
              <li key={item.bookId} className="flex items-center justify-between">
                <span>{item.title}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.bookId)}
                  className="text-red-600 hover:underline ml-2 shrink-0"
                >
                  Xóa khỏi giỏ
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Giỏ hàng trống.</p>
          <Link
            to="/sach"
            className="text-green-800 font-medium hover:underline"
          >
            Mua sắm ngay →
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-200 text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Sách</th>
                  <th className="pb-3 font-medium">Đơn giá</th>
                  <th className="pb-3 font-medium">Số lượng</th>
                  <th className="pb-3 font-medium">Thành tiền</th>
                  <th className="pb-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {validItems.map((item) =>
                  (() => {
                    const hasDiscount =
                      Number(item.originalPrice || 0) > Number(item.price || 0);
                    const discountPercent = hasDiscount
                      ? Math.round(
                          ((item.originalPrice - item.price) /
                            item.originalPrice) *
                            100,
                        )
                      : null;
                    return (
                      <tr
                        key={item.bookId}
                        className="border-b border-green-50"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-20 bg-green-50 rounded overflow-hidden shrink-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title || "Ảnh sách"}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  📖
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-gray-800">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="text-green-800 font-medium">
                            {item.price.toLocaleString("vi-VN")}₫
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 min-h-[18px]">
                            <span
                              className={`text-xs line-through ${hasDiscount ? "text-gray-400" : "text-transparent"}`}
                            >
                              {hasDiscount
                                ? `${Number(item.originalPrice).toLocaleString("vi-VN")}₫`
                                : "0₫"}
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
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.bookId, item.quantity - 1)
                              }
                              className="w-8 h-8 rounded border border-green-200 text-green-800 hover:bg-green-50"
                            >
                              −
                            </button>
                            <span className="w-10 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.bookId, item.quantity + 1)
                              }
                              className="w-8 h-8 rounded border border-green-200 text-green-800 hover:bg-green-50"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 font-medium">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          ₫
                        </td>
                        <td className="py-4">
                          <button
                            type="button"
                            onClick={() => removeItem(item.bookId)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })(),
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Link
              to="/sach"
              className="text-green-800 font-medium hover:underline"
            >
              ← Tiếp tục mua sắm
            </Link>
            <div className="flex items-center gap-6">
              <p className="text-xl font-bold text-green-900">
                Tổng tiền: {total.toLocaleString("vi-VN")}₫
              </p>
              <Link
                to="/thanh-toan"
                className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
