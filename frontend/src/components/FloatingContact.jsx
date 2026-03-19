import { useState, useEffect } from 'react';
import { FaFacebookF, FaInstagram, FaTiktok, FaPhoneAlt } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { useApiStore } from '../store/apiStore';

const circleBtnCls =
  'w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition';

export default function FloatingContact() {
  const { siteConfig, fetchSiteConfig } = useApiStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!siteConfig) {
      fetchSiteConfig().catch(() => {});
    }
  }, [siteConfig, fetchSiteConfig]);

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
    {
      key: 'phone',
      url: buildPhoneHref(siteConfig?.phone),
      label: siteConfig?.phone ? `Gọi ${siteConfig.phone}` : 'Liên hệ ngay',
      Icon: FaPhoneAlt,
      bg: 'bg-green-600 hover:bg-green-700 border-green-700 text-white',
    },
    {
      key: 'zalo',
      url: buildZaloHref(siteConfig?.zaloUrl),
      label: 'Zalo',
      Icon: SiZalo,
      bg: 'bg-[#e5f3ff] hover:bg-[#d6ebff] border-[#c2defa] text-[#0068ff]',
    },
    {
      key: 'facebook',
      url: siteConfig?.facebookUrl,
      label: 'Facebook',
      Icon: FaFacebookF,
      bg: 'bg-white hover:bg-gray-50 border-gray-200 text-[#1877f2]',
    },
    {
      key: 'instagram',
      url: siteConfig?.instagramUrl,
      label: 'Instagram',
      Icon: FaInstagram,
      bg: 'bg-white hover:bg-gray-50 border-gray-200 text-[#d6249f]',
    },
    {
      key: 'tiktok',
      url: siteConfig?.tiktokUrl,
      label: 'TikTok',
      Icon: FaTiktok,
      bg: 'bg-white hover:bg-gray-50 border-gray-200 text-black',
    },
  ].filter((l) => l.url);

  return (
    <div className="fixed right-4 bottom-4 z-40">
      {links.length > 0 && (
        <div
          className={`flex flex-col items-end gap-2 mb-2 transition-opacity ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'
          }`}
        >
          {links.map(({ key, url, label, Icon, bg }) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${circleBtnCls} ${bg}`}
              aria-label={label}
              title={label}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
            </a>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${circleBtnCls} contact-gradient border-none text-white flex gap-2 px-3 w-auto`}
      >
        <FaPhoneAlt className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-semibold">Liên hệ ngay</span>
      </button>
    </div>
  );
}

