import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function SellBookGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Seo
        title="Hướng dẫn thanh lý sách"
        description="Hướng dẫn thanh lý sách tại Sách Truyện Mỹ Hạnh: chuẩn bị thông tin, gửi yêu cầu và quy trình thẩm định."
      />
      <div className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Hướng dẫn thanh lý sách</span>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">Hướng dẫn thanh lý sách</h1>

        <p className="text-gray-700 leading-relaxed mb-5">
          Cửa hàng hỗ trợ thu mua/nhận ký gửi sách theo từng thời điểm, ưu tiên sách còn tốt,
          nội dung phổ biến và có nhu cầu đọc cao.
        </p>

        <ol className="space-y-4 text-gray-700">
          <li>
            <p className="font-semibold text-green-800">1) Chuẩn bị thông tin sách</p>
            <p>
              Chụp ảnh bìa, gáy và tình trạng bên trong. Ghi rõ tên sách, số lượng, mức độ mới,
              ghi chú thiếu/trầy/ố (nếu có).
            </p>
          </li>
          <li>
            <p className="font-semibold text-green-800">2) Gửi yêu cầu thanh lý</p>
            <p>
              Vào mục <span className="font-medium">Bán sách cho cửa hàng</span>, điền form thông tin
              và để lại số liên hệ chính xác.
            </p>
          </li>
          <li>
            <p className="font-semibold text-green-800">3) Cửa hàng thẩm định</p>
            <p>
              Đội ngũ sẽ phản hồi tình trạng tiếp nhận, giá dự kiến và hình thức giao/nhận sách.
            </p>
          </li>
          <li>
            <p className="font-semibold text-green-800">4) Chốt giao dịch</p>
            <p>
              Sau khi thống nhất, cửa hàng tiến hành nhận sách và thanh toán theo thỏa thuận.
            </p>
          </li>
        </ol>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="font-semibold text-green-800 mb-1">Nhóm sách ưu tiên</p>
            <p className="text-sm text-gray-700">
              Truyện tranh, văn học, sách kỹ năng, sách thiếu nhi còn mới, bản in rõ, không rách nát.
            </p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="font-semibold text-red-700 mb-1">Nhóm sách hạn chế</p>
            <p className="text-sm text-gray-700">
              Sách hư hỏng nặng, thiếu trang, ẩm mốc, nội dung vi phạm hoặc bản in không rõ nguồn gốc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

