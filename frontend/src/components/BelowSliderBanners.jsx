import { Link } from "react-router-dom";

function BannerLink({ href, children, className }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export default function BelowSliderBanners({ sliders }) {
  const banners = (sliders || [])
    .filter((s) => (s.order ?? 0) >= 100)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (banners.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {banners.slice(0, 6).map((b) => (
        <BannerLink
          key={b._id}
          href={b.link || ""}
          className="bg-white rounded-xl border border-green-100 overflow-hidden transition block"
        >
          <div className="aspect-[12/6] bg-green-50">
            <img
              src={b.image}
              alt={b.title || "Banner Hiệu Sách Mỹ Hạnh"}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </BannerLink>
      ))}
    </div>
  );
}
