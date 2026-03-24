import express from "express";
import Book from "../models/Book.js";
import Category from "../models/Category.js";

const router = express.Router();

const BASE_URL = "https://hieusachsamsam.store";
const IMAGE_BASE_URL = `${BASE_URL}/uploads`;

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/sach", priority: "0.9", changefreq: "daily" },
  { path: "/ban-sach", priority: "0.8", changefreq: "weekly" },
  { path: "/gio-hang", priority: "0.5", changefreq: "monthly" },
  { path: "/thanh-toan", priority: "0.4", changefreq: "monthly" },
  { path: "/don-hang", priority: "0.4", changefreq: "monthly" },
  { path: "/ve-chung-toi", priority: "0.7", changefreq: "monthly" },
  { path: "/lien-he", priority: "0.7", changefreq: "monthly" },
  {
    path: "/huong-dan-mua-hang-online",
    priority: "0.6",
    changefreq: "monthly",
  },
  { path: "/huong-dan-thanh-ly-sach", priority: "0.6", changefreq: "monthly" },
  { path: "/cau-hoi-thuong-gap", priority: "0.6", changefreq: "monthly" },
];

function xmlEscape(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date) {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
}

function generateUrlEntry(loc, priority, changefreq, lastmod = null) {
  let entry = "  <url>\n";
  entry += `    <loc>${loc}</loc>\n`;
  if (lastmod) {
    entry += `    <lastmod>${formatDate(lastmod)}</lastmod>\n`;
  }
  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  entry += "  </url>\n";
  return entry;
}

router.get("/sitemap.xml", async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const MAX_URLS = 50000;

    const [books, categories] = await Promise.all([
      Book.find({}, "slug updatedAt createdAt").sort({ updatedAt: -1 }).lean(),
      Category.find({}, "slug updatedAt").lean(),
    ]);

    const totalUrls = STATIC_ROUTES.length + categories.length + books.length;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';

    if (totalUrls > MAX_URLS) {
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      xml += "  <sitemap>\n";
      xml += `    <loc>${BASE_URL}/sitemap-static.xml</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += "  </sitemap>\n";

      xml += "  <sitemap>\n";
      xml += `    <loc>${BASE_URL}/sitemap-categories.xml</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += "  </sitemap>\n";

      xml += "  <sitemap>\n";
      xml += `    <loc>${BASE_URL}/sitemap-books.xml</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += "  </sitemap>\n";

      xml += "</sitemapindex>";
    } else {
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      for (const route of STATIC_ROUTES) {
        xml += generateUrlEntry(
          `${BASE_URL}${route.path}`,
          route.priority,
          route.changefreq,
          currentDate
        );
      }

      for (const cat of categories) {
        if (!cat.slug) continue;
        const slug = xmlEscape(cat.slug);
        xml += generateUrlEntry(
          `${BASE_URL}/sach/${slug}`,
          "0.7",
          "daily",
          cat.updatedAt || currentDate
        );
      }

      for (const book of books) {
        if (!book.slug) continue;
        const slug = xmlEscape(book.slug);
        xml += generateUrlEntry(
          `${BASE_URL}/sach/${slug}`,
          "0.8",
          "weekly",
          book.updatedAt || book.createdAt || currentDate
        );
      }

      xml += "</urlset>";
    }

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=86400");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

router.get("/sitemap-static.xml", async (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of STATIC_ROUTES) {
    xml += generateUrlEntry(
      `${BASE_URL}${route.path}`,
      route.priority,
      route.changefreq,
      currentDate
    );
  }

  xml += "</urlset>";
  res.header("Content-Type", "application/xml");
  res.header("Cache-Control", "public, max-age=86400");
  res.send(xml);
});

router.get("/sitemap-categories.xml", async (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  try {
    const categories = await Category.find({}, "slug updatedAt").lean();
    for (const cat of categories) {
      if (!cat.slug) continue;
      const slug = xmlEscape(cat.slug);
      xml += generateUrlEntry(
        `${BASE_URL}/sach/${slug}`,
        "0.7",
        "daily",
        cat.updatedAt || currentDate
      );
    }
  } catch (err) {
    console.error("Categories sitemap error:", err);
  }

  xml += "</urlset>";
  res.header("Content-Type", "application/xml");
  res.header("Cache-Control", "public, max-age=86400");
  res.send(xml);
});

router.get("/sitemap-books.xml", async (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  try {
    const books = await Book.find({}, "slug title images updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    for (const book of books) {
      if (!book.slug) continue;
      const slug = xmlEscape(book.slug);
      const title = xmlEscape(book.title || "");

      xml += "  <url>\n";
      xml += `    <loc>${BASE_URL}/sach/${slug}</loc>\n`;
      xml += `    <lastmod>${formatDate(book.updatedAt || book.createdAt || currentDate)}</lastmod>\n`;
      xml += "    <changefreq>weekly</changefreq>\n";
      xml += "    <priority>0.8</priority>\n";

      if (book.images && book.images.length > 0) {
        for (const img of book.images.slice(0, 5)) {
          const imgUrl = img.startsWith("http") ? img : `${IMAGE_BASE_URL}/${img}`;
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${imgUrl}</image:loc>\n`;
          xml += `      <image:title>${title}</image:title>\n`;
          xml += `    </image:image>\n`;
        }
      }

      xml += "  </url>\n";
    }
  } catch (err) {
    console.error("Books sitemap error:", err);
  }

  xml += "</urlset>";
  res.header("Content-Type", "application/xml");
  res.header("Cache-Control", "public, max-age=86400");
  res.send(xml);
});

router.get("/robots.txt", (req, res) => {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  res.type("text/plain");
  res.send(
`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /don-hang
Disallow: /ban-sach
Disallow: /thanh-toan
Disallow: /gio-hang

Sitemap: ${sitemapUrl}
Sitemap: ${BASE_URL}/sitemap-static.xml
Sitemap: ${BASE_URL}/sitemap-categories.xml
Sitemap: ${BASE_URL}/sitemap-books.xml`
  );
});

export default router;
