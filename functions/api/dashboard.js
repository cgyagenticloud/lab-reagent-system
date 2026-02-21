export async function onRequestGet(context) {
  const db = context.env.DB;
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [total, lowStock, expiring, expired, recentUsage, catCounts] = await Promise.all([
    db.prepare("SELECT COUNT(*) as cnt FROM reagents").first(),
    db.prepare("SELECT r.*, c.name as category_name, c.color as category_color FROM reagents r LEFT JOIN categories c ON r.category_id=c.id WHERE r.current_stock <= r.minimum_threshold").all(),
    db.prepare("SELECT r.*, c.name as category_name, c.color as category_color FROM reagents r LEFT JOIN categories c ON r.category_id=c.id WHERE r.expiration_date IS NOT NULL AND r.expiration_date <= ? AND r.expiration_date >= ? ORDER BY r.expiration_date").bind(cutoff, today).all(),
    db.prepare("SELECT r.*, c.name as category_name FROM reagents r LEFT JOIN categories c ON r.category_id=c.id WHERE r.expiration_date IS NOT NULL AND r.expiration_date < ?").bind(today).all(),
    db.prepare("SELECT ul.*, r.name as reagent_name, u.name as user_name FROM usage_log ul LEFT JOIN reagents r ON ul.reagent_id=r.id LEFT JOIN users u ON ul.user_id=u.id ORDER BY ul.date DESC LIMIT 10").all(),
    db.prepare("SELECT c.name, c.color, COUNT(r.id) as count FROM categories c LEFT JOIN reagents r ON r.category_id=c.id GROUP BY c.id ORDER BY count DESC").all(),
  ]);

  return Response.json({
    total: total.cnt,
    low_stock: lowStock.results,
    low_stock_count: lowStock.results.length,
    expiring: expiring.results,
    expiring_count: expiring.results.length,
    expired_count: expired.results.length,
    recent_usage: recentUsage.results,
    categories: catCounts.results,
  });
}
