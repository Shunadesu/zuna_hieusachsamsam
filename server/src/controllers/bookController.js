import Book from "../models/Book.js";
import { slugify, normalizeSlugSegment } from "../utils/slugify.js";

export async function getBooks(req, res) {
  try {
    const {
      search,
      categoryId,
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      isHot,
    } = req.query;
    const query = {};
    if (search) query.title = new RegExp(search, "i");
    if (categoryId) query.categoryId = categoryId;
    if (isHot !== undefined && isHot !== "") query.isHot = isHot === "true";
    if (minPrice !== undefined && minPrice !== "")
      query.price = { ...(query.price || {}), $gte: Number(minPrice) };
    if (maxPrice !== undefined && maxPrice !== "")
      query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
    if (minQuantity !== undefined && minQuantity !== "")
      query.quantity = { ...(query.quantity || {}), $gte: Number(minQuantity) };
    if (maxQuantity !== undefined && maxQuantity !== "")
      query.quantity = { ...(query.quantity || {}), $lte: Number(maxQuantity) };
    const skip = (Number(page) - 1) * Number(limit);
    const [list, total] = await Promise.all([
      Book.find(query)
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Book.countDocuments(query),
    ]);
    res.json({ data: list, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBookBySlug(req, res) {
  try {
    const param = req.params.slug;
    const hyphenForm = normalizeSlugSegment(param);

    let book = await Book.findOne({
      $or: [{ slug: param }, { slug: hyphenForm }],
    })
      .populate("categoryId", "name slug")
      .lean();

    if (!book) {
      const rows = await Book.find({}, "title slug").lean();
      const match = rows.find((b) => {
        const fromTitle = slugify(b.title || "");
        return (
          fromTitle === param ||
          fromTitle === hyphenForm ||
          normalizeSlugSegment(b.slug) === hyphenForm
        );
      });
      if (match) {
        book = await Book.findById(match._id)
          .populate("categoryId", "name slug")
          .lean();
      }
    }
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBookById(req, res) {
  try {
    const book = await Book.findById(req.params.id).populate(
      "categoryId",
      "name slug",
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createBook(req, res) {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      image,
      images,
      categoryId,
      quantity,
      status,
      isHot,
    } = req.body;
    const baseSlug = slugify(title || "book");
    let slug = baseSlug;
    let n = 0;
    while (await Book.findOne({ slug })) slug = `${baseSlug}-${++n}`;
    const imageList =
      Array.isArray(images) && images.length > 0
        ? images.filter(Boolean)
        : image
          ? [image]
          : [];
    const primaryImage = imageList[0] || image || "";
    const book = await Book.create({
      title,
      slug,
      description: description || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      image: primaryImage,
      images: imageList,
      categoryId: categoryId || null,
      quantity: Number(quantity) || 0,
      status: quantity === 0 ? "out_of_stock" : status || "available",
      isHot: isHot === true || isHot === "true",
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateBook(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    const {
      title,
      description,
      price,
      originalPrice,
      image,
      images,
      categoryId,
      quantity,
      status,
      isHot,
    } = req.body;
    if (title !== undefined) book.title = title;
    if (description !== undefined) book.description = description;
    if (price !== undefined) book.price = Number(price);
    if (originalPrice !== undefined) book.originalPrice = Number(originalPrice);
    if (image !== undefined) book.image = image;
    if (images !== undefined) {
      const imageList = Array.isArray(images) ? images.filter(Boolean) : [];
      book.images = imageList;
      if (imageList.length > 0) book.image = imageList[0];
    } else if (image !== undefined) book.image = image;
    if (categoryId !== undefined) book.categoryId = categoryId || null;
    if (quantity !== undefined) {
      book.quantity = Number(quantity);
      book.status = book.quantity === 0 ? "out_of_stock" : "available";
    }
    if (status !== undefined) book.status = status;
    if (isHot !== undefined) book.isHot = isHot === true || isHot === "true";
    if (title) book.slug = slugify(title);
    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteBook(req, res) {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function uploadBookImages(req, res) {
  try {
    const files = req.files || [];
    const urls = files.map((file) => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
