import { useEffect } from 'react';
import { useApiStore } from '../store/apiStore';
import { FaFacebookF, FaInstagram, FaTiktok, FaPhoneAlt } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { SiZalo } from 'react-icons/si';

const iconLinkClass =
  'inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white border border-white/80 text-green-800 hover:text-green-800 transition shrink-0';

export default function TopBar() {
  const { siteConfig, fetchSiteConfig } = useApiStore();

  useEffect(() => {
    fetchSiteConfig().catch(() => {});
  }, [fetchSiteConfig]);

  const buildZaloHref = (value) => {
    const raw = (value || '').trim();
    if (!raw) return '';
    if (raw.startsWith('http')) return raw;
    const digits = raw.replace(/\D/g, '');
    return digits ? `https://zalo.me/${digits}` : '';
  };

  const buildPhoneHref = (value) => {
    const raw = (value || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/[^\d+]/g, '');
    return digits ? `tel:${digits}` : '';
  };

  const links = [
    { key: 'phone', url: buildPhoneHref(siteConfig?.phone), label: 'Liên hệ ngay', Icon: FaPhoneAlt },
    { key: 'zalo', url: buildZaloHref(siteConfig?.zaloUrl), label: 'Zalo', Icon: SiZalo },
    { key: 'facebook', url: siteConfig?.facebookUrl, label: 'Facebook', Icon: FaFacebookF },
    { key: 'instagram', url: siteConfig?.instagramUrl, label: 'Instagram', Icon: FaInstagram },
    { key: 'tiktok', url: siteConfig?.tiktokUrl, label: 'TikTok', Icon: FaTiktok },
  ].filter((l) => l.url);

  return (
    <div className="bg-green-800">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-start gap-2 text-xs sm:text-sm text-white font-medium min-w-0">
          <FaLocationDot className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-95" aria-hidden="true" />
          <span className="leading-snug sm:truncate sm:max-w-[min(100%,28rem)]">
            120/61/16 đường số 59, P14, Gò Vấp, HCM.
          </span>
        </div>
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
