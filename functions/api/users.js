export async function onRequestGet(context) {
  const result = await context.env.DB.prepare("SELECT * FROM users ORDER BY name").all();
  return Response.json(result.results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  try {
    await db.prepare("INSERT INTO users (name, email, role) VALUES (?,?,?)")
      .bind(body.name, body.email, body.role || 'member').run();
    return Response.json({ ok: true });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 400 });
  }
}
