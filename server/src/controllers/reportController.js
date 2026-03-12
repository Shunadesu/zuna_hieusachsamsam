import Order from '../models/Order.js';

export async function getSalesReport(req, res) {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    const match = { status: { $in: ['paid', 'confirmed', 'shipping', 'completed'] } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const format = groupBy === 'month' ? '%Y-%m' : groupBy === 'week' ? '%Y-%W' : '%Y-%m-%d';
    const group = groupBy === 'month' ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : groupBy === 'week' ? { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } }
      : { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } };

    const results = await Order.aggregate([
      { $match: match },
      { $group: { _id: group, totalRevenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
