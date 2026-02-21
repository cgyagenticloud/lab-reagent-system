export async function onRequestDelete(context) {
  await context.env.DB.prepare("DELETE FROM users WHERE id=?").bind(context.params.id).run();
  return Response.json({ ok: true });
}
