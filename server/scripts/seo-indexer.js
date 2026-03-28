/**
 * SEO Indexer — Batch submit URLs lên Google Indexing API
 *
 * Cách dùng:
 *   1. Tạo Google Cloud Project + Enable Indexing API
 *   2. Tạo Service Account + tải JSON key → lưu vào env hoặc file
 *   3. Set biến môi trường hoặc chạy:
 *
 *   # Khai báo inline (hoặc set trong .env)
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
 *
 *   # Chạy
 *   node scripts/seo-indexer.js [options]
 *
 * Options:
 *   --dry-run     Chỉ liệt kê URLs, không submit
 *   --type=book   Chỉ submit sách
 *   --type=all    Submit tất cả (default)
 *   --limit=N     Giới hạn số lượng sách (default: 100)
 *   --url=URL     Submit 1 URL cụ thể
 *
 * Ví dụ:
 *   node scripts/seo-indexer.js --dry-run
 *   node scripts/seo-indexer.js --type=book --limit=500
 *   node scripts/seo-indexer.js --url="https://www.hieusachmyhanh.com/sach/ten-sach"
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Cấu hình ────────────────────────────────────────────────────────────────

const SITE_URL = process.env.SITE_URL || "https://www.hieusachmyhanh.com";
const API_ORIGIN = process.env.API_ORIGIN || "https://hieusachsamsam.store";
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/hieusach";

// Google credentials từ env hoặc file
const GOOGLE_SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const GOOGLE_KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// ─── Args ────────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, v] = arg.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const DRY_RUN = args["dry-run"] === true || args["dry-run"] === "true";
const TYPE = args["type"] || "all";
const LIMIT = parseInt(args["limit"] || "100", 10);
const SINGLE_URL = args["url"] || null;

// ─── Kết nối Google Indexing API ─────────────────────────────────────────────

function getGoogleAuth() {
  if (GOOGLE_KEY_FILE) {
    return new google.auth.GoogleAuth({
      keyFile: GOOGLE_KEY_FILE,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });
  }
  if (GOOGLE_SA_EMAIL && GOOGLE_PRIVATE_KEY) {
    return new google.auth.JWT({
      email: GOOGLE_SA_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });
  }
  return null;
}

let indexingApi = null;
try {
  const auth = getGoogleAuth();
  if (auth) {
    google.options({ auth });
    indexingApi = google.indexing({ version: "v3", auth });
  }
} catch (err) {
  console.warn("⚠️  Không khởi tạo được Google Indexing API:", err.message);
}

// ─── Hàm submit URL ──────────────────────────────────────────────────────────

async function submitUrl(url, method = "URL_UPDATED") {
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] ${method} → ${url}`);
    return { ok: true, dryRun: true };
  }
  if (!indexingApi) {
    console.log(`  [SKIP - no API] ${method} → ${url}`);
    return { ok: false, reason: "No API" };
  }
  try {
    const res = await indexingApi.urlNotifications.publish({
      requestBody: {
        type: method,
        url,
      },
    });
    console.log(`  ✅ ${method} → ${url}`);
    return { ok: true, res: res.data };
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    console.log(`  ❌ ${method} → ${url} (${status}: ${msg})`);
    return { ok: false, status, msg };
  }
}

// ─── Submit batch ─────────────────────────────────────────────────────────────

async function submitBatch(urls, method = "URL_UPDATED") {
  const results = { ok: 0, fail: 0, skipped: 0, errors: [] };
  for (const url of urls) {
    const r = await submitUrl(url, method);
    if (r.ok) results.ok++;
    else if (r.reason === "No API") results.skipped++;
    else {
      results.fail++;
      results.errors.push(r);
    }
    await new Promise((r) => setTimeout(r, 200)); // rate limit
  }
  return results;
}

// ─── Static URLs ──────────────────────────────────────────────────────────────

function getStaticUrls() {
  return [
    { path: "/", label: "Trang chủ", method: "URL_UPDATED" },
    { path: "/sach", label: "Danh sách sách", method: "URL_UPDATED" },
    { path: "/ban-sach", label: "Bán sách", method: "URL_UPDATED" },
    { path: "/ve-chung-toi", label: "Về chúng tôi", method: "URL_UPDATED" },
    { path: "/lien-he", label: "Liên hệ", method: "URL_UPDATED" },
    { path: "/cau-hoi-thuong-gap", label: "Câu hỏi thường gặp", method: "URL_UPDATED" },
    { path: "/huong-dan-mua-hang-online", label: "Hướng dẫn mua online", method: "URL_UPDATED" },
    { path: "/huong-dan-thanh-ly-sach", label: "Hướng dẫn thanh lý sách", method: "URL_UPDATED" },
  ].map((r) => ({ ...r, url: `${SITE_URL}${r.path}` }));
}

// ─── MongoDB models ──────────────────────────────────────────────────────────

let Book, Category;

async function connectDb() {
  await mongoose.connect(MONGODB_URI);
  Book = mongoose.model("Book", new mongoose.Schema({ title: String, slug: String, updatedAt: Date }, { strict: false }));
  Category = mongoose.model("Category", new mongoose.Schema({ name: String, slug: String }, { strict: false }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀 SEO Indexer — Batch Submit to Google Indexing API\n");
  console.log(`📍 Site: ${SITE_URL}`);
  console.log(`📊 Mode: ${DRY_RUN ? "DRY RUN (chỉ liệt kê, không submit)" : "LIVE (sẽ submit thật)"}`);
  if (!indexingApi) {
    console.log(
      "\n⚠️  CẢNH BÁO: Chưa có Google credentials.\n" +
        "   Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY trong .env\n" +
        "   Hoặc GOOGLE_APPLICATION_CREDENTIALS trỏ tới file JSON key.\n" +
        "   Script sẽ chạy dry-run mặc dù có --dry-run hay không.\n"
    );
  }

  // Single URL
  if (SINGLE_URL) {
    console.log(`\n📌 Submit 1 URL:\n`);
    const r = await submitUrl(SINGLE_URL);
    console.log(`\nKết quả: ${r.ok ? "✅ Thành công" : "❌ Thất bại"}`);
    return;
  }

  await connectDb();

  // ── Static routes ──────────────────────────────────────────────────────────
  if (TYPE === "all" || TYPE === "static") {
    const staticUrls = getStaticUrls();
    console.log(`\n📄 Static Routes (${staticUrls.length} URLs):\n`);
    const r = await submitBatch(staticUrls.map((u) => u.url));
    console.log(`   ✅ OK: ${r.ok} | ❌ Fail: ${r.fail} | Skipped: ${r.skipped}`);
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  if (TYPE === "all" || TYPE === "category") {
    const cats = await Category.find({}, "slug updatedAt")
      .sort({ updatedAt: -1 })
      .lean()
      .limit(500);
    const catUrls = cats
      .filter((c) => c.slug)
      .map((c) => `${SITE_URL}/sach/${c.slug}`);

    console.log(`\n📂 Categories (${catUrls.length} URLs):\n`);
    if (catUrls.length) {
      const r = await submitBatch(catUrls);
      console.log(`   ✅ OK: ${r.ok} | ❌ Fail: ${r.fail} | Skipped: ${r.skipped}`);
    }
  }

  // ── Books ──────────────────────────────────────────────────────────────────
  if (TYPE === "all" || TYPE === "book") {
    const books = await Book.find({}, "slug updatedAt")
      .sort({ updatedAt: -1 })
      .lean()
      .limit(LIMIT);

    const bookUrls = books.filter((b) => b.slug).map((b) => `${SITE_URL}/sach/${b.slug}`);

    console.log(`\n📚 Books (${bookUrls.length} URLs, limit: ${LIMIT}):\n`);
    if (bookUrls.length) {
      const r = await submitBatch(bookUrls);
      console.log(`   ✅ OK: ${r.ok} | ❌ Fail: ${r.fail} | Skipped: ${r.skipped}`);
      if (r.errors.length) {
        console.log(`\n   Lỗi chi tiết:`);
        r.errors.forEach((e, i) => console.log(`   ${i + 1}. ${e.status} — ${e.msg}`));
      }
    }
  }

  console.log("\n✅ Hoàn tất!\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
