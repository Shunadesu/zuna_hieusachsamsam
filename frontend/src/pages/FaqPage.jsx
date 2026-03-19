import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const faqs = [
  {
    q: 'Làm sao để đặt hàng trên website?',
    a: 'Bạn chọn sách, thêm vào giỏ hoặc bấm Mua ngay, sau đó hoàn tất thông tin tại trang thanh toán.',
  },
  {
    q: 'Tôi có cần tài khoản để mua hàng không?',
    a: 'Không bắt buộc. Bạn vẫn có thể đặt hàng với vai trò khách, chỉ cần điền đúng thông tin giao nhận.',
  },
  {
    q: 'Khi nào đơn hàng của tôi được xác nhận?',
    a: 'Sau khi bạn xác nhận thanh toán, cửa hàng sẽ kiểm tra và liên hệ xác nhận đơn trong thời gian sớm nhất.',
  },
  {
    q: 'Có thể đổi/trả sách không?',
    a: 'Cửa hàng hỗ trợ theo chính sách từng trường hợp. Bạn vui lòng liên hệ sớm để được hướng dẫn cụ thể.',
  },
  {
    q: 'Tôi muốn thanh lý sách thì làm thế nào?',
    a: 'Truy cập mục Bán sách cho cửa hàng, gửi thông tin kèm ảnh tình trạng sách để cửa hàng thẩm định.',
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Seo
        title="Câu hỏi thường gặp"
        description="Giải đáp các câu hỏi thường gặp về đặt hàng, thanh toán, giao nhận và thanh lý sách tại Sách Truyện Mỹ Hạnh."
      />
      <div className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Câu hỏi thường gặp</span>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">Câu hỏi thường gặp</h1>
        <p className="text-gray-700 mb-6">
          Tổng hợp các câu hỏi phổ biến khi mua sách online và thanh lý sách tại Hiệu Sách Mỹ Hạnh.
        </p>

        <div className="space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="group rounded-xl border border-green-100 bg-green-50/60 p-4">
              <summary className="cursor-pointer list-none font-semibold text-green-800 flex items-start justify-between gap-3">
                <span>{item.q}</span>
                <span className="text-green-700 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-2 text-gray-700 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

