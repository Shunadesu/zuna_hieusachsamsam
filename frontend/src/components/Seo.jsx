import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Sách Truyện Mỹ Hạnh";

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://www.hieusachmyhanh.com"
).replace(/\/$/, "");

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "https://hieusachsamsam.store"
).replace(/\/$/, "");

const DEFAULT_DESCRIPTION =
  "Sách Truyện Mỹ Hạnh - thu mua, bán sách truyện cũ toàn quốc với nhiều danh mục và ưu đãi mỗi ngày.";

const DEFAULT_KEYWORDS =
  "mua bán sách cũ, sách truyện cũ, sách xưa trước 1975, nhạc tờ cổ, truyện tranh 199x, truyện tuổi thơ, truyện tranh nam nữ, truyện lẻ truyện bộ, nhà sách Gò Vấp, Sách Truyện Mỹ Hạnh";

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const ROBOTS_CONTENT =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

function toAbsoluteImageUrl(value) {
  if (!value || typeof value !== "string") return null;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return `${API_ORIGIN}/${value}`;
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath,
  book,
}) {
  const location = useLocation();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const path = canonicalPath ?? location.pathname;
  const canonicalUrl = `${SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = toAbsoluteImageUrl(image) || DEFAULT_OG_IMAGE;

  const schemas = [];

  if (book) {
    const bookImages = (book.images || []).map((img) => ({
      "@type": "ImageObject",
      url: toAbsoluteImageUrl(img),
    }));
    if (book.image) {
      bookImages.unshift({
        "@type": "ImageObject",
        url: toAbsoluteImageUrl(book.image),
      });
    }

    const offers = {
      "@type": "Offer",
      price: Number(book.price ?? 0).toFixed(0),
      priceCurrency: "VND",
      availability: book.status === "out_of_stock"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: canonicalUrl,
    };

    schemas.push({
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.title,
      description: book.description || description,
      url: canonicalUrl,
      image: bookImages,
      offers,
      ...(book.categoryId?.name && {
        about: {
          "@type": "Thing",
          name: book.categoryId.name,
        },
      }),
    });
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={ROBOTS_CONTENT} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={book ? "product" : "website"} />
      {book && (
        <>
          <meta property="product:price:amount" content={Number(book.price ?? 0).toFixed(0)} />
          <meta property="product:price:currency" content="VND" />
        </>
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {schemas.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)}
        </script>
      )}
    </Helmet>
  );
}
