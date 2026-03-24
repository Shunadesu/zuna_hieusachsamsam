import Category from "../models/Category.js";
import { slugify } from "../utils/slugify.js";

export async function getCategories(req, res) {
  try {
    const list = await Category.find().sort({ order: 1, name: 1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCategoryById(req, res) {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, parentId, order, image } = req.body;
    const slug = slugify(name || "category");
    const existing = await Category.findOne({ slug });
    if (existing)
      return res.status(400).json({ message: "Slug already exists" });
    const category = await Category.create({
      name,
      slug,
      image: req.file ? `/uploads/${req.file.filename}` : image || "",
      parentId: parentId || null,
      order: order ?? 0,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const { name, parentId, order, image } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (req.file) category.image = `/uploads/${req.file.filename}`;
    else if (image !== undefined) category.image = image;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (order !== undefined) category.order = order;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
