import SellRequest from '../models/SellRequest.js';

export async function createSellRequest(req, res) {
  try {
    const { bookInfo, phone, address, note } = req.body;
    if (!bookInfo || !phone || !address) return res.status(400).json({ message: 'bookInfo, phone, address required' });
    const request = await SellRequest.create({
      userId: req.userId,
      bookInfo,
      phone,
      address,
      note: note || '',
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getSellRequests(req, res) {
  try {
    const list = await SellRequest.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateSellRequestStatus(req, res) {
  try {
    const { status } = req.body;
    const doc = await SellRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
