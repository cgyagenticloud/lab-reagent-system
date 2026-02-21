export async function onRequestGet(context) {
  const result = await context.env.DB.prepare(
    "SELECT o.*, r.name as reagent_name, u.name as orderer_name FROM orders o LEFT JOIN reagents r ON o.reagent_id=r.id LEFT JOIN users u ON o.ordered_by=u.id ORDER BY o.date_ordered DESC"
  ).all();
  return Response.json(result.results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  await db.prepare(
    "INSERT INTO orders (reagent_id, vendor, catalog_number, quantity, price, po_number, date_ordered, ordered_by, notes) VALUES (?,?,?,?,?,?,?,?,?)"
  ).bind(
    body.reagent_id, body.vendor, body.catalog_number, body.quantity,
    body.price, body.po_number, body.date_ordered, body.ordered_by, body.notes
  ).run();
  return Response.json({ ok: true });
}
