import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Sách Truyện Mỹ Hạnh';
const DEFAULT_DESCRIPTION =
  'Sách Truyện Mỹ Hạnh - mua bán sách truyện cũ toàn quốc, nhiều đầu sách chất lượng và ưu đãi hấp dẫn.';

export default function Seo({ title, description = DEFAULT_DESCRIPTION }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}

