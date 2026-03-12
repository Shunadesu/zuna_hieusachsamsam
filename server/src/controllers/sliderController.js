import Slider from '../models/Slider.js';

export async function getSliders(req, res) {
  try {
    const list = await Slider.find().sort({ order: 1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createSlider(req, res) {
  try {
    const { image, link, order } = req.body;
    const slider = await Slider.create({ image: image || req.file?.path || '', link: link || '', order: order ?? 0 });
    res.status(201).json(slider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateSlider(req, res) {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });
    if (req.body.image !== undefined) slider.image = req.body.image;
    if (req.body.link !== undefined) slider.link = req.body.link;
    if (req.body.order !== undefined) slider.order = req.body.order;
    await slider.save();
    res.json(slider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteSlider(req, res) {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
