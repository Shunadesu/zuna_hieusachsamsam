import { useEffect } from "react";
import { useApiStore } from "../store/apiStore";
import { FaFacebookF, FaInstagram, FaTiktok, FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot, FaMapLocation } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";

const BING_MAPS_URL =
  "https://www.bing.com/maps/search?v=2&pc=FACEBK&mid=8100&mkt=en-US&FORM=FBKPL1&q=120%2F61%2F16+%C4%91%C6%B0%E1%BB%9Dng+59+%2C+An+H%E1%BB%99i+T%C3%A2y+%2C+HCM%2C+Ho+Chi+Minh+City%2C+Vietnam&cp=10.853315%7E106.650175&lvl=16&style=r";

const iconLinkClass =
  "inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white border border-white/80 text-green-800 hover:text-green-800 transition shrink-0";

export default function TopBar() {
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
    {
      key: "maps",
      url: BING_MAPS_URL,
      label: "Xem bản đồ",
      Icon: FaMapLocation,
    },
  ].filter((l) => l.url);

  return (
    <div className="bg-green-800">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <a
          href={BING_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-xs sm:text-sm text-white font-medium min-w-0 hover:opacity-90 transition"
        >
          <FaLocationDot
            className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-95"
            aria-hidden="true"
          />
          <span className="leading-snug sm:truncate sm:max-w-[min(100%,28rem)]">
            120/61/16 đường số 59, P14, Gò Vấp, HCM.
          </span>
          <FaMapLocation
            className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80"
            aria-hidden="true"
          />
        </a>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:justify-end sm:shrink-0">
          {links.map(({ key, url, label, Icon }) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={iconLinkClass}
              aria-label={label}
              title={label}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
