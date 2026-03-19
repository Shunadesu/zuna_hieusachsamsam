import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Seo
        title="Về chúng tôi"
        description="Tìm hiểu về Sách Truyện Mỹ Hạnh, sứ mệnh và giá trị mang sách truyện chất lượng đến cộng đồng yêu đọc."
      />
      <div className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Về chúng tôi</span>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">Về chúng tôi</h1>

        <p className="text-gray-700 leading-relaxed mb-4">
          Hiệu Sách Mỹ Hạnh là cửa hàng chuyên sách, truyện và ấn phẩm đọc dành cho nhiều lứa tuổi,
          tập trung vào chất lượng sản phẩm, giá hợp lý và trải nghiệm mua hàng thân thiện.
        </p>

        <p className="text-gray-700 leading-relaxed mb-4">
          Chúng tôi tin rằng mỗi cuốn sách đều có hành trình riêng. Vì vậy, cửa hàng luôn ưu tiên
          tuyển chọn đầu sách kỹ lưỡng, cập nhật các tựa sách hot, đồng thời hỗ trợ khách hàng tìm
          đúng thể loại phù hợp với nhu cầu đọc và ngân sách.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="font-semibold text-green-800">Sản phẩm chọn lọc</p>
            <p className="text-sm text-gray-600 mt-1">Ưu tiên chất lượng và tính phù hợp.</p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="font-semibold text-green-800">Giá cả minh bạch</p>
            <p className="text-sm text-gray-600 mt-1">Niêm yết rõ ràng, nhiều ưu đãi theo đợt.</p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="font-semibold text-green-800">Hỗ trợ tận tâm</p>
            <p className="text-sm text-gray-600 mt-1">Tư vấn nhanh, đồng hành trước và sau mua.</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-green-800 mb-2">Sứ mệnh</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Mang sách chất lượng đến gần hơn với cộng đồng yêu đọc, giúp việc mua sách online trở nên
          dễ dàng, minh bạch và đáng tin cậy.
        </p>

        <h2 className="text-lg font-semibold text-green-800 mb-2">Giá trị cốt lõi</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>Chân thành trong tư vấn và phục vụ khách hàng.</li>
          <li>Minh bạch về tình trạng sách, giá và chính sách mua bán.</li>
          <li>Liên tục cải thiện trải nghiệm đặt hàng và hỗ trợ sau mua.</li>
        </ul>
      </div>
    </div>
  );
}

