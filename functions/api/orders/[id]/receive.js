export async function onRequestPost(context) {
  const db = context.env.DB;
  const id = context.params.id;
  const today = new Date().toISOString().slice(0, 10);

  await db.prepare("UPDATE orders SET status='received', date_received=? WHERE id=?").bind(today, id).run();
  const order = await db.prepare("SELECT reagent_id, quantity FROM orders WHERE id=?").bind(id).first();
  if (order && order.reagent_id) {
    await db.prepare("UPDATE reagents SET current_stock = current_stock + ?, updated_at=datetime('now') WHERE id=?")
      .bind(order.quantity, order.reagent_id).run();
  }
  return Response.json({ ok: true });
}
