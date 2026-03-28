import { useState, useEffect } from "react";
import Seo from "../components/Seo";
import api from "../services/api";
import { FaBook, FaLayerGroup, FaSitemap, FaGoogle, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "https://hieusachsamsam.store").replace(/\/$/, "");
const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.hieusachmyhanh.com").replace(/\/$/, "");

function formatNumber(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("vi-VN");
}

function StatusBadge({ ok, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
        ok
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-600 border-red-200"
      }`}
    >
      {ok ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-green-700" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatRow({ label, value, badge, note }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {badge}
        {value != null && (
          <span className="text-sm font-semibold text-gray-900">{value}</span>
        )}
        {note && <span className="text-xs text-gray-400">{note}</span>}
      </div>
    </div>
  );
}

export default function SeoStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [booksRes, catsRes] = await Promise.allSettled([
          api.get("/api/books", { params: { limit: 1, page: 1 } }),
          api.get("/api/categories", { params: { limit: 1, page: 1 } }),
        ]);

        const booksTotal = booksRes.status === "fulfilled" ? booksRes.value.data?.total : null;
        const catsTotal = catsRes.status === "fulfilled" ? catsRes.value.data?.total : null;

        setStats({ booksTotal, catsTotal });
      } catch (err) {
        setError("Không lấy được dữ liệu từ server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const staticRoutes = [
      { path: "/", priority: "1.0", changefreq: "daily", label: "Trang chủ" },
      { path: "/sach", priority: "0.9", changefreq: "daily", label: "Danh sách sách" },
      { path: "/ban-sach", priority: "0.8", changefreq: "weekly", label: "Bán sách" },
      { path: "/ve-chung-toi", priority: "0.7", changefreq: "monthly", label: "Về chúng tôi" },
      { path: "/lien-he", priority: "0.7", changefreq: "monthly", label: "Liên hệ" },
      { path: "/cau-hoi-thuong-gap", priority: "0.6", changefreq: "monthly", label: "Câu hỏi thường gặp" },
      { path: "/huong-dan-mua-hang-online", priority: "0.6", changefreq: "monthly", label: "Hướng dẫn mua online" },
      { path: "/huong-dan-thanh-ly-sach", priority: "0.6", changefreq: "monthly", label: "Hướng dẫn thanh lý sách" },
      { path: "/gio-hang", priority: "0.5", changefreq: "monthly", label: "Giỏ hàng" },
      { path: "/thanh-toan", priority: "0.4", changefreq: "monthly", label: "Thanh toán" },
      { path: "/don-hang", priority: "0.4", changefreq: "monthly", label: "Đơn hàng" },
    ];

    const sitemaps = [
      { url: `${SITE_URL}/sitemap.xml`, label: "Sitemap chính", status: "pending" },
      { url: `${SITE_URL}/sitemap-static.xml`, label: "Sitemap tĩnh", status: "pending" },
      { url: `${SITE_URL}/sitemap-categories.xml`, label: "Sitemap danh mục", status: "pending" },
      { url: `${SITE_URL}/sitemap-books.xml`, label: "Sitemap sách (Image)", status: "pending" },
      { url: `${SITE_URL}/robots.txt`, label: "Robots.txt", status: "pending" },
    ];

    Promise.allSettled(sitemaps.map((s) => fetch(s.url, { method: "HEAD" }))).then(
      (results) => {
        const updated = sitemaps.map((s, i) => ({
          ...s,
          status: results[i].status === "fulfilled" ? "ok" : "fail",
        }));
        setPages({ staticRoutes, sitemaps: updated });
      }
    );
  }, []);

  const seoChecks = [
    {
      label: "Google Search Console đã xác minh",
      ok: true,
      note: "Đã xác minh qua file HTML",
    },
    {
      label: "Favicon trỏ tới file SVG công khai",
      ok: true,
      note: "/favicon.svg",
    },
    {
      label: "Meta description có trên trang",
      ok: true,
      note: "index.html + Seo.jsx",
    },
    {
      label: "Meta keywords có trên trang",
      ok: true,
      note: "Seo.jsx",
    },
    {
      label: "Canonical URL đúng domain",
      ok: true,
      note: "www.hieusachmyhanh.com",
    },
    {
      label: "Sitemap có trên server",
      ok: pages.sitemaps?.[0]?.status === "ok",
      note: "Chưa xác nhận — kiểm tra sau deploy",
    },
    {
      label: "Robots.txt cho phép Googlebot",
      ok: pages.sitemaps?.[4]?.status === "ok",
      note: "Chưa xác nhận — kiểm tra sau deploy",
    },
    {
      label: "Structured Data (JSON-LD) cho Book",
      ok: true,
      note: "BookDetailPage + Seo.jsx",
    },
    {
      label: "Open Graph tags đầy đủ",
      ok: true,
      note: "og:title, og:description, og:image, og:url",
    },
    {
      label: "Twitter Card tags",
      ok: true,
      note: "twitter:card, twitter:image",
    },
    {
      label: "Robots meta tag",
      ok: true,
      note: "index, follow",
    },
  ];

  const indexedCount = seoChecks.filter((c) => c.ok).length;
  const totalChecks = seoChecks.length;
  const percent = Math.round((indexedCount / totalChecks) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Seo
        title="Thống kê SEO & Lập chỉ mục Google"
        description="Theo dõi trạng thái lập chỉ mục SEO, sitemap, structured data và các yếu tố Google cần thiết cho Sách Truyện Mỹ Hạnh."
        canonicalPath="/seo-stats"
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Thống kê SEO & Lập chỉ mục Google
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi trạng thái lập chỉ mục và các yếu tố SEO cho website
        </p>
      </div>

      {/* Score */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" stroke="#fff"
                strokeWidth="3" strokeDasharray={`${percent} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{percent}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm opacity-80 mb-1">Điểm SEO</div>
            <div className="text-2xl font-bold">
              {percent >= 80 ? "Tốt" : percent >= 50 ? "Trung bình" : "Cần cải thiện"}
            </div>
            <div className="text-sm opacity-80 mt-1">
              {indexedCount}/{totalChecks} mục đạt —{" "}
              <span className="underline">Kiểm tra bên dưới</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Books */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <FaBook className="w-4 h-4 text-green-700" />
            Tổng sách
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {loading ? (
              <span className="text-gray-300 animate-pulse">···</span>
            ) : (
              formatNumber(stats?.booksTotal)
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Sách trong database</p>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <FaLayerGroup className="w-4 h-4 text-green-700" />
            Danh mục
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {loading ? (
              <span className="text-gray-300 animate-pulse">···</span>
            ) : (
              formatNumber(stats?.catsTotal)
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Danh mục đang hoạt động</p>
        </div>

        {/* URLs in sitemap */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <FaSitemap className="w-4 h-4 text-green-700" />
            URLs trong sitemap
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {loading ? (
              <span className="text-gray-300 animate-pulse">···</span>
            ) : (
              <>
                {formatNumber(
                  (stats?.booksTotal || 0) +
                    (stats?.catsTotal || 0) +
                    11
                )}
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Sách + Danh mục + Trang tĩnh
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEO Checklist */}
        <SectionCard title="SEO Checklist" icon={FaGoogle}>
          {seoChecks.map((check, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-700 flex-1">{check.label}</span>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <StatusBadge ok={check.ok} label={check.ok ? "OK" : "Thiếu"} />
                {check.note && (
                  <span className="text-xs text-gray-400">{check.note}</span>
                )}
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Sitemap Status */}
        <div className="space-y-5">
          <SectionCard title="Trạng thái Sitemap & Robots" icon={FaSitemap}>
            {pages.sitemaps?.map((s, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700">{s.label}</div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 hover:underline break-all"
                  >
                    {s.url}
                  </a>
                </div>
                <StatusBadge
                  ok={s.status === "ok"}
                  label={s.status === "ok" ? "OK" : s.status === "fail" ? "404" : "..."}
                />
              </div>
            ))}
          </SectionCard>

          {/* Static Routes */}
          <SectionCard title="Các trang tĩnh trong Sitemap" icon={FaClock}>
            {pages.staticRoutes?.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
              >
                <a
                  href={`${SITE_URL}${r.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:underline flex-1 min-w-0 truncate"
                >
                  {r.path}
                </a>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-xs text-gray-400">
                    p:{r.priority} · {r.changefreq}
                  </span>
                  <FaCheckCircle className="w-3.5 h-3.5 text-green-500" />
                </div>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>

      {/* Hướng dẫn index */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-3">
          <FaExclamationTriangle className="w-4 h-4" />
          Hướng dẫn lập chỉ mục nhanh trên Google
        </h3>
        <ol className="text-sm text-blue-900 space-y-2 list-decimal list-inside">
          <li>
            <strong>Submit sitemap</strong> — Vào{" "}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              Google Search Console
            </a>{" "}
            → Sitemaps → nhập{" "}
            <code className="bg-blue-100 px-1 rounded text-xs">
              https://www.hieusachmyhanh.com/sitemap.xml
            </code>
          </li>
          <li>
            <strong>URL Inspection</strong> — Inspect trang chủ → "Request indexing" để
            Google index ngay lập tức.
          </li>
          <li>
            <strong>Inspect & Submit</strong> — Inspect 3-5 trang quan trọng nhất (trang
            chủ, danh sách sách, 1-2 chi tiết sách, trang về chúng tôi) rồi submit.
          </li>
          <li>
            <strong>Batch submit</strong> — Dùng{" "}
            <a
              href="https://developers.google.com/search/apis/indexing-method/v3/batch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              Indexing API
            </a>{" "}
            hoặc export URLs từ sitemaps rồi submit qua{" "}
            <a
              href="https://indexingplatform.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              URL Inspection API
            </a>
            .
          </li>
          <li>
            <strong>Theo dõi</strong> — Kiểm tra tab "Pages" trong Search Console để xem
            trạng thái: <em>Discovered – currently not indexed</em>,{" "}
            <em>Indexed</em>, hoặc <em>Excluded</em>.
          </li>
        </ol>
      </div>
    </div>
  );
}
