import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function OnlinePurchaseGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Seo
        title="Hướng dẫn mua hàng Online"
        description="Xem hướng dẫn chi tiết các bước mua hàng online tại Sách Truyện Mỹ Hạnh từ chọn sách đến xác nhận thanh toán."
      />
      <div className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Hướng dẫn mua hàng Online</span>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">Hướng dẫn mua hàng Online</h1>

        <ol className="space-y-4 text-gray-700">
          <li>
            <p className="font-semibold text-green-800">Bước 1: Tìm sản phẩm</p>
            <p>
              Truy cập mục <span className="font-medium">Sách</span>, lọc theo danh mục hoặc dùng ô tìm kiếm để
              tìm tựa sách bạn cần.
            </p>
          </li>
          <li>
            <p className="font-semibold text-green-800">Bước 2: Xem chi tiết</p>
            <p>
              Mở trang chi tiết để xem ảnh, giá bán, thông tin khuyến mãi và tình trạng còn hàng.
            </p>
          </li>
          <li>
            <p className="font-semibold text-green-800">Bước 3: Chọn hình thức mua</p>
            <p>
              Nhấn <span className="font-medium">Thêm vào giỏ</span> để mua nhiều sản phẩm hoặc
              <span className="font-medium"> Mua ngay</span> để thanh toán nhanh cho sản phẩm đang xem.
            </p>
          </li>
          <li>
            <p className="font-semibold text-green-800">Bước 4: Điền thông tin giao hàng</p>
            <p>
              Tại trang thanh toán, vui lòng nhập đầy đủ họ tên, số điện thoại, địa chỉ nhận hàng
              (đối với khách chưa đăng nhập).
            </p>
          </li>
          <li>
            <p className="font-semibold text-green-800">Bước 5: Xác nhận thanh toán</p>
            <p>
              Chuyển khoản theo thông tin QR hiển thị, sau đó nhấn xác nhận. Cửa hàng sẽ kiểm tra và
              liên hệ xác nhận đơn sớm nhất.
            </p>
          </li>
        </ol>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">Lưu ý</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vui lòng kiểm tra kỹ thông tin giao nhận trước khi xác nhận.</li>
            <li>Đơn hàng sẽ được giữ trong thời gian xác minh thanh toán theo chính sách cửa hàng.</li>
            <li>Nếu cần hỗ trợ gấp, vui lòng liên hệ trực tiếp qua số điện thoại cửa hàng.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

