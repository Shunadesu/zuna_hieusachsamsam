import Order from '../models/Order.js';
import Book from '../models/Book.js';

export async function createOrder(req, res) {
  try {
    const { guestInfo, items, total, shippingFee, paymentMethod } = req.body;
    if (!items?.length || total == null) return res.status(400).json({ message: 'Items and total required' });
    const method = ['bank_transfer', 'cod', 'direct'].includes(paymentMethod) ? paymentMethod : 'bank_transfer';
    const normalizedShippingFee = method === 'cod' ? 25000 : Number(shippingFee) || 0;
    const order = await Order.create({
      userId: req.userId || null,
      guestInfo: guestInfo || null,
      items,
      total: Number(total),
      shippingFee: normalizedShippingFee,
      paymentMethod: method,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email').lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (status) order.status = status;
    if (status === 'paid') order.paymentConfirmedAt = new Date();
    if (req.body.paymentNote !== undefined) order.paymentNote = req.body.paymentNote;
    await order.save();

    // Auto-mark books as sold when order is completed
    if (status === 'completed' && Array.isArray(order.items)) {
      const bookIds = order.items
        .filter((item) => item.bookId)
        .map((item) => item.bookId);
      if (bookIds.length > 0) {
        await Book.updateMany(
          { _id: { $in: bookIds } },
          { $set: { status: 'sold' } }
        );
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function confirmPayment(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'paid';
    order.paymentConfirmedAt = new Date();
    if (req.body.paymentNote) order.paymentNote = req.body.paymentNote;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
