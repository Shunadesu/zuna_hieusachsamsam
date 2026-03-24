import { Helmet } from "react-helmet-async";

const SITE_NAME = "Sách Truyện Mỹ Hạnh";
const BASE_URL = "https://hieusachsamsam.store";
const DEFAULT_DESCRIPTION =
  "Sách Truyện Mỹ Hạnh - mua bán sách truyện cũ toàn quốc, nhiều đầu sách chất lượng và ưu đãi hấp dẫn.";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
