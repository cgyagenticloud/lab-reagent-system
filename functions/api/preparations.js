export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const reagentId = url.searchParams.get('reagentId');
  const q = url.searchParams.get('q') || '';

  let sql = `SELECT p.*, r.name as reagent_name, u.name as preparer_name 
             FROM preparations p 
             LEFT JOIN reagents r ON p.reagent_id=r.id 
             LEFT JOIN users u ON p.prepared_by=u.id WHERE 1=1`;
  const params = [];

  if (reagentId) { sql += " AND p.reagent_id=?"; params.push(reagentId); }
  if (q) { sql += " AND (p.name LIKE ? OR p.protocol LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }

  sql += " ORDER BY p.date_prepared DESC";
  const stmt = db.prepare(sql);
  const result = await (params.length ? stmt.bind(...params) : stmt).all();
  return Response.json(result.results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  const result = await db.prepare(
    `INSERT INTO preparations (reagent_id, name, protocol, concentration, volume, unit, prepared_by, date_prepared, expiration_date, parent_reagents, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    body.reagent_id, body.name, body.protocol || null, body.concentration || null,
    body.volume || null, body.unit || 'mL', body.prepared_by || null,
    body.date_prepared || new Date().toISOString().slice(0,10),
    body.expiration_date || null, JSON.stringify(body.parent_reagents || []),
    body.notes || null
  ).run();
  return Response.json({ id: result.meta.last_row_id });
}
