import Order from '../models/Order.js';

export async function createOrder(req, res) {
  try {
    const { guestInfo, items, total, shippingFee, paymentMethod } = req.body;
    if (!items?.length || total == null) return res.status(400).json({ message: 'Items and total required' });
    const order = await Order.create({
      userId: req.userId || null,
      guestInfo: guestInfo || null,
      items,
      total: Number(total),
      shippingFee: Number(shippingFee) || 0,
      paymentMethod: paymentMethod || 'bank_transfer',
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
