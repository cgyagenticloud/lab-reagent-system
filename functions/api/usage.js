export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  await db.prepare("INSERT INTO usage_log (reagent_id, user_id, quantity_used, notes) VALUES (?,?,?,?)")
    .bind(body.reagent_id, body.user_id, body.quantity_used, body.notes).run();
  await db.prepare("UPDATE reagents SET current_stock = MAX(0, current_stock - ?), updated_at=datetime('now') WHERE id=?")
    .bind(body.quantity_used, body.reagent_id).run();
  return Response.json({ ok: true });
}
