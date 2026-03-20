import { useEffect } from 'react';
import { FaPhoneVolume } from 'react-icons/fa';
import { useApiStore } from '../store/apiStore';

function buildPhoneHref(value) {
  const raw = (value || '').trim();
  if (!raw) return '';
  const digits = raw.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
}

export default function HeaderCallToBuy() {
  const { siteConfig, fetchSiteConfig } = useApiStore();

  useEffect(() => {
    fetchSiteConfig().catch(() => {});
  }, [fetchSiteConfig]);

  const phone = (siteConfig?.phone || '').trim();
  const href = buildPhoneHref(phone);
  if (!phone || !href) return null;

  return (
    <a
      href={href}
      className="flex items-center gap-2 p-2 sm:p-0 sm:px-1.5 sm:py-1 mr-0.5 sm:mr-1 rounded-lg hover:bg-green-50 active:bg-green-100 transition shrink-0 border border-transparent hover:border-green-100"
      aria-label={`Gọi mua hàng ${phone}`}
    >
      <FaPhoneVolume className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-700 sm:text-green-600 shrink-0" aria-hidden />
      <span className="hidden sm:flex flex-col leading-tight min-w-0">
        <span className="text-[11px] sm:text-xs text-green-600 font-medium">Gọi mua hàng</span>
        <span className="text-sm font-bold text-green-800 tracking-tight">{phone}</span>
      </span>
    </a>
  );
}
