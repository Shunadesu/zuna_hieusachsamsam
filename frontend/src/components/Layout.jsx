import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import TopBar from './TopBar';
import Header from './Header';
import Footer from './Footer';
import FloatingContact from './FloatingContact';

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://www.hieusachmyhanh.com'
).replace(/\/$/, '');

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Sách Truyện Mỹ Hạnh',
  alternateName: 'Mỹ Hạnh Bookstore',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/favicon.svg`,
  },
  description:
    'Thu mua, bán sách truyện cũ toàn quốc. Chuyên sách trước 1975, nhạc tờ cổ, truyện tranh 199x, truyện tuổi thơ.',
  email: 'lienhe@hieusachmyhanh.vn',
  areaServed: {
    '@type': 'Country',
    name: 'Vietnam',
  },
  sameAs: [],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Sách Truyện Mỹ Hạnh',
  url: SITE_URL,
  description:
    'Mua bán sách cũ, truyện tranh xưa 199x, sách trước 1975 toàn quốc.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/sach?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function Layout({ onOpenCart }) {
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify([organizationSchema, websiteSchema])}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TopBar />
        <Header onOpenCart={onOpenCart} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <FloatingContact />
      </div>
    </>
  );
}
