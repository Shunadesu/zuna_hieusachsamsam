const VIETNAMESE_MAP = {
  à: "a",
  á: "a",
  ả: "a",
  ã: "a",
  ạ: "a",
  ă: "a",
  ằ: "a",
  ắ: "a",
  ẳ: "a",
  ẵ: "a",
  ặ: "a",
  â: "a",
  ầ: "a",
  ấ: "a",
  ẩ: "a",
  ẫ: "a",
  ậ: "a",
  đ: "d",
  è: "e",
  é: "e",
  ẻ: "e",
  ẽ: "e",
  ẹ: "e",
  ê: "e",
  ề: "e",
  ế: "e",
  ể: "e",
  ễ: "e",
  ệ: "e",
  ì: "i",
  í: "i",
  ỉ: "i",
  ĩ: "i",
  ị: "i",
  ò: "o",
  ó: "o",
  ỏ: "o",
  õ: "o",
  ọ: "o",
  ô: "o",
  ồ: "o",
  ố: "o",
  ổ: "o",
  ỗ: "o",
  ộ: "o",
  ơ: "o",
  ờ: "o",
  ớ: "o",
  ở: "o",
  ỡ: "o",
  ợ: "o",
  ù: "u",
  ú: "u",
  ủ: "u",
  ũ: "u",
  ụ: "u",
  ư: "u",
  ừ: "u",
  ứ: "u",
  ử: "u",
  ữ: "u",
  ự: "u",
  ỳ: "y",
  ý: "y",
  ỷ: "y",
  ỹ: "y",
  ỵ: "y",
};

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => VIETNAMESE_MAP[ch] ?? ch)
    .join("")
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/** Đồng bộ slug lưu DB (gạch dưới) với URL dùng gạch ngang. */
export function normalizeSlugSegment(slug) {
  if (slug == null || slug === "") return "";
  return String(slug)
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug dùng cho URL chi tiết sách: theo tiêu đề (bỏ dấu), fallback slug DB đã chuẩn hóa. */
export function bookPathSlug(book) {
  if (!book) return "";
  const fromTitle = slugify(book.title || "");
  if (fromTitle) return fromTitle;
  return normalizeSlugSegment(book.slug);
}
