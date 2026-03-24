import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApiStore } from "../store/apiStore";
import { FaFacebookF, FaInstagram, FaTiktok, FaPhoneAlt } from "react-icons/fa";
import { FaMapLocation } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";

const BING_MAPS_URL =
  "https://www.bing.com/maps/search?v=2&pc=FACEBK&mid=8100&mkt=en-US&FORM=FBKPL1&q=120%2F61%2F16+%C4%91%C6%B0%E1%BB%9Dng+59+%2C+An+H%E1%BB%99i+T%C3%A2y+%2C+HCM%2C+Ho+Chi+Minh+City%2C+Vietnam&cp=10.853315%7E106.650175&lvl=16&style=r";

export default function Footer() {
  const { siteConfig, fetchSiteConfig } = useApiStore();

  useEffect(() => {
    fetchSiteConfig().catch(() => {});
  }, [fetchSiteConfig]);

  const buildZaloHref = (value) => {
    const raw = (value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("http")) return raw;
    const digits = raw.replace(/\D/g, "");
    return digits ? `https://zalo.me/${digits}` : "";
  };

  const buildPhoneHref = (value) => {
    const raw = (value || "").trim();
    if (!raw) return "";
    const digits = raw.replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "";
  };

  const links = [
    {
      key: "phone",
      url: buildPhoneHref(siteConfig?.phone),
      label: "Liên hệ ngay",
      Icon: FaPhoneAlt,
    },
    {
      key: "zalo",
      url: buildZaloHref(siteConfig?.zaloUrl),
      label: "Zalo",
      Icon: SiZalo,
    },
    {
      key: "facebook",
      url: siteConfig?.facebookUrl,
      label: "Facebook",
      Icon: FaFacebookF,
    },
    {
      key: "instagram",
      url: siteConfig?.instagramUrl,
      label: "Instagram",
      Icon: FaInstagram,
    },
    {
      key: "tiktok",
      url: siteConfig?.tiktokUrl,
      label: "TikTok",
      Icon: FaTiktok,
    },
  ].filter((l) => l.url);

  const mapsLink = [
    {
      key: "maps",
      url: BING_MAPS_URL,
      label: "Xem bản đồ",
      Icon: FaMapLocation,
    },
  ].filter((l) => l.url);

  const policyLinks = [
    { to: "/ve-chung-toi", label: "Về chúng tôi" },
    { to: "/lien-he", label: "Liên hệ" },
    { to: "/huong-dan-mua-hang-online", label: "Hướng dẫn mua hàng Online" },
    { to: "/huong-dan-thanh-ly-sach", label: "Hướng dẫn thanh lý sách" },
    { to: "/cau-hoi-thuong-gap", label: "Câu hỏi thường gặp" },
  ];

  return (
    <footer className="bg-green-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Hiệu Sách Mỹ Hạnh
            </h3>
            <div className="text-sm text-green-100 space-y-1.5">
              {/* <p>36 người theo dõi • 1 đang theo dõi</p> */}
              <p>Thu mua - bán sách truyện cũ trên toàn quốc</p>
              <p>Giúp bạn tìm lại tuổi thơ trên từng trang sách truyện.</p>
              <p>Sđt/zalo 0985017828</p>
              <p>
                Địa chỉ:{" "}
                <a
                  href={BING_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80"
                >
                  120/61/16 đường số 59, p14, Gò Vấp, HCM.
                </a>
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              {links.map(({ key, url, label, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-green-100 hover:text-white transition"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
              {mapsLink.map(({ key, url, label, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-green-100 hover:text-white transition"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Thông tin</h3>
            <ul className="space-y-2">
              {policyLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-green-100 hover:text-white text-sm transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Liên hệ & Vị trí
            </h3>
            {siteConfig?.googleMapsUrl ? (
              <iframe
                src={siteConfig.googleMapsUrl}
                title="Bản đồ"
                className="w-full h-48 rounded-lg border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <p className="text-green-200 text-sm">
                Xem bản đồ tại trang liên hệ.
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-green-700 mt-6 pt-4 text-center text-green-300 text-sm">
          © {new Date().getFullYear()} Hiệu Sách Mỹ Hạnh. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
