import Promotion from '../models/Promotion.js';

export async function getPromotions(req, res) {
  try {
    const list = await Promotion.find().populate('bookIds', 'title').sort({ startDate: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createPromotion(req, res) {
  try {
    const { name, type, value, startDate, endDate, bookIds } = req.body;
    const promotion = await Promotion.create({ name, type, value, startDate, endDate, bookIds: bookIds || [] });
    res.status(201).json(promotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePromotion(req, res) {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deletePromotion(req, res) {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
