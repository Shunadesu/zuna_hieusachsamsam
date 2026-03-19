import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApiStore } from '../store/apiStore';
import Seo from '../components/Seo';

export default function ContactPage() {
  const { siteConfig, fetchSiteConfig } = useApiStore();

  useEffect(() => {
    fetchSiteConfig().catch(() => {});
  }, [fetchSiteConfig]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Seo
        title="Liên hệ"
        description="Liên hệ Sách Truyện Mỹ Hạnh để được tư vấn đơn hàng, mua sách online và hỗ trợ thanh lý sách nhanh chóng."
      />
      <div className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:text-green-700">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Liên hệ</span>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">Liên hệ</h1>
        <p className="text-gray-700 leading-relaxed mb-6">
          Cần hỗ trợ đơn hàng, tư vấn chọn sách hoặc thanh lý sách? Đội ngũ của Hiệu Sách Mỹ Hạnh
          luôn sẵn sàng hỗ trợ bạn nhanh nhất có thể.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm text-gray-600">Địa chỉ cửa hàng</p>
            <p className="font-semibold text-green-800 mt-1">
              120/61/16 đường số 59, P14, Gò Vấp, TP. HCM
            </p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <p className="text-sm text-gray-600">Khung giờ hỗ trợ</p>
            <p className="font-semibold text-green-800 mt-1">08:00 - 21:00 (Thứ 2 - Chủ nhật)</p>
          </div>
        </div>

        <div className="space-y-2 text-gray-700 mb-6">
          <p><span className="font-semibold text-green-800">Số điện thoại:</span> {siteConfig?.phone || '0900 000 000'}</p>
          <p><span className="font-semibold text-green-800">Zalo:</span> {siteConfig?.zaloUrl || 'Đang cập nhật'}</p>
          <p><span className="font-semibold text-green-800">Email:</span> lienhe@hieusachmyhanh.vn</p>
          <p><span className="font-semibold text-green-800">Facebook:</span> {siteConfig?.facebookUrl || 'Đang cập nhật'}</p>
          <p><span className="font-semibold text-green-800">Instagram:</span> {siteConfig?.instagramUrl || 'Đang cập nhật'}</p>
          <p><span className="font-semibold text-green-800">TikTok:</span> {siteConfig?.tiktokUrl || 'Đang cập nhật'}</p>
        </div>

        <h2 className="text-lg font-semibold text-green-800 mb-2">Bản đồ</h2>
        {siteConfig?.googleMapsUrl ? (
          <iframe
            src={siteConfig.googleMapsUrl}
            title="Bản đồ cửa hàng"
            className="w-full h-72 rounded-xl border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <p className="text-gray-500 text-sm">Bản đồ đang được cập nhật.</p>
        )}
      </div>
    </div>
  );
}

