export async function onRequestGet(context) {
  const db = context.env.DB;
  const result = await db.prepare(
    "SELECT c.*, COUNT(r.id) as reagent_count FROM categories c LEFT JOIN reagents r ON r.category_id=c.id GROUP BY c.id ORDER BY c.name"
  ).all();
  return Response.json(result.results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  try {
    await db.prepare("INSERT INTO categories (name, description, color) VALUES (?,?,?)")
      .bind(body.name, body.description, body.color || '#6c757d').run();
    return Response.json({ ok: true });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Category already exists' }), { status: 400 });
  }
}
