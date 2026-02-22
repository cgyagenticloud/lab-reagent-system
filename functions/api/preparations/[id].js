export async function onRequestPut(context) {
  const db = context.env.DB;
  const id = context.params.id;
  const body = await context.request.json();
  await db.prepare(
    `UPDATE preparations SET reagent_id=?, name=?, protocol=?, concentration=?, volume=?, unit=?, prepared_by=?, date_prepared=?, expiration_date=?, parent_reagents=?, notes=? WHERE id=?`
  ).bind(
    body.reagent_id, body.name, body.protocol || null, body.concentration || null,
    body.volume || null, body.unit || 'mL', body.prepared_by || null,
    body.date_prepared || null, body.expiration_date || null,
    JSON.stringify(body.parent_reagents || []), body.notes || null, id
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  await db.prepare("DELETE FROM preparations WHERE id=?").bind(context.params.id).run();
  return Response.json({ ok: true });
}
