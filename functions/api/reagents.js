export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || '';
  const vendor = url.searchParams.get('vendor') || '';
  const storage = url.searchParams.get('storage') || '';
  const stockStatus = url.searchParams.get('stock_status') || '';

  let sql = "SELECT r.*, c.name as category_name, c.color as category_color FROM reagents r LEFT JOIN categories c ON r.category_id=c.id WHERE 1=1";
  const params = [];

  if (q) {
    sql += " AND (r.name LIKE ? OR r.cas_number LIKE ? OR r.catalog_number LIKE ? OR r.vendor LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) { sql += " AND c.name = ?"; params.push(category); }
  if (vendor) { sql += " AND r.vendor = ?"; params.push(vendor); }
  if (storage) { sql += " AND r.storage_temp = ?"; params.push(storage); }
  if (stockStatus === 'low') sql += " AND r.current_stock <= r.minimum_threshold";
  else if (stockStatus === 'ok') sql += " AND r.current_stock > r.minimum_threshold";

  sql += " ORDER BY r.name";
  const stmt = db.prepare(sql);
  const result = await (params.length ? stmt.bind(...params) : stmt).all();
  return Response.json(result.results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();
  const result = await db.prepare(
    `INSERT INTO reagents (name, cas_number, catalog_number, lot_number, vendor, category_id, storage_location, storage_temp, current_stock, unit, minimum_threshold, price_per_unit, expiration_date, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    body.name, body.cas_number, body.catalog_number, body.lot_number, body.vendor,
    body.category_id, body.storage_location, body.storage_temp,
    body.current_stock || 0, body.unit || 'units', body.minimum_threshold || 1,
    body.price_per_unit, body.expiration_date, body.notes
  ).run();
  return Response.json({ id: result.meta.last_row_id });
}
