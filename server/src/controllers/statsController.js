import Order from '../models/Order.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';

const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

const groupByMonth = (orders, months = 6) => {
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
    buckets.push({ label, revenue: 0, count: 0 });
  }
  for (const o of orders) {
    const created = new Date(o.createdAt);
    const idx = months - 1 - (now.getMonth() - created.getMonth()) -
      (now.getFullYear() - created.getFullYear()) * 12;
    if (idx >= 0 && idx < buckets.length) {
      if (o.status === 'completed' || o.status === 'paid') {
        buckets[idx].revenue += Number(o.total) || 0;
      }
      buckets[idx].count += 1;
    }
  }
  return buckets;
};

export async function getStats(req, res) {
  try {
    const [
      allOrders,
      books,
      categories,
    ] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      Book.find().lean(),
      Category.find().lean(),
    ]);

    const completedOrders = allOrders.filter(
      (o) => o.status === 'completed' || o.status === 'paid',
    );
    const totalRevenue = completedOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const monthRevenue = completedOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((s, o) => s + (Number(o.total) || 0), 0);

    const statusCounts = {
      pending: 0, confirmed: 0, paid: 0,
      shipping: 0, completed: 0, cancelled: 0,
    };
    for (const o of allOrders) {
      if (o.status in statusCounts) statusCounts[o.status]++;
    }

    const monthly = groupByMonth(allOrders);

    const topBooks = [...allOrders]
      .flatMap((o) => o.items || [])
      .reduce((acc, item) => {
        const key = item.bookId ? String(item.bookId) : item.title;
        const existing = acc.find((a) => a.bookId === key);
        if (existing) {
          existing.quantity += Number(item.quantity) || 1;
          existing.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
        } else {
          acc.push({
            bookId: key,
            title: item.title || '—',
            quantity: Number(item.quantity) || 1,
            revenue: (Number(item.price) || 0) * (Number(item.quantity) || 1),
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    const recentOrders = allOrders.slice(0, 8);

    res.json({
      totalOrders: allOrders.length,
      totalBooks: books.length,
      totalCategories: categories.length,
      soldBooks: books.filter((b) => b.status === 'sold').length,
      outOfStockBooks: books.filter((b) => b.status === 'out_of_stock').length,
      totalRevenue,
      monthRevenue,
      statusCounts,
      monthly,
      topBooks,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
