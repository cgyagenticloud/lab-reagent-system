export async function onRequestDelete(context) {
  const db = context.env.DB;
  const id = context.params.id;
  await db.prepare("UPDATE reagents SET category_id=NULL WHERE category_id=?").bind(id).run();
  await db.prepare("DELETE FROM categories WHERE id=?").bind(id).run();
  return Response.json({ ok: true });
}
