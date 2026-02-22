export async function onRequestGet(context) {
  const db = context.env.DB;
  const id = context.params.id;
  const r = await db.prepare(
    "SELECT r.*, c.name as category_name, c.color as category_color FROM reagents r LEFT JOIN categories c ON r.category_id=c.id WHERE r.id=?"
  ).bind(id).first();
  if (!r) return new Response("Not found", { status: 404 });

  const [usage, orders, preparations] = await Promise.all([
    db.prepare("SELECT ul.*, u.name as user_name FROM usage_log ul LEFT JOIN users u ON ul.user_id=u.id WHERE ul.reagent_id=? ORDER BY ul.date DESC LIMIT 20").bind(id).all(),
    db.prepare("SELECT o.*, u.name as orderer_name FROM orders o LEFT JOIN users u ON o.ordered_by=u.id WHERE o.reagent_id=? ORDER BY o.date_ordered DESC").bind(id).all(),
    db.prepare("SELECT p.*, u.name as preparer_name FROM preparations p LEFT JOIN users u ON p.prepared_by=u.id WHERE p.reagent_id=? ORDER BY p.date_prepared DESC").bind(id).all(),
  ]);

  r.usage = usage.results;
  r.orders = orders.results;
  r.preparations = preparations.results;
  return Response.json(r);
}

export async function onRequestPut(context) {
  const db = context.env.DB;
  const id = context.params.id;
  const body = await context.request.json();
  await db.prepare(
    `UPDATE reagents SET name=?, cas_number=?, catalog_number=?, lot_number=?, vendor=?, category_id=?, storage_location=?, storage_temp=?, current_stock=?, unit=?, minimum_threshold=?, price_per_unit=?, expiration_date=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).bind(
    body.name, body.cas_number, body.catalog_number, body.lot_number, body.vendor,
    body.category_id, body.storage_location, body.storage_temp,
    body.current_stock || 0, body.unit || 'units', body.minimum_threshold || 1,
    body.price_per_unit, body.expiration_date, body.notes, id
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  const id = context.params.id;
  await db.prepare("DELETE FROM reagents WHERE id=?").bind(id).run();
  return Response.json({ ok: true });
}
