interface Env {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
}

// Parse a TEXT column that may be a JSON array string like '["Chiffon"]'
const parseJsonArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try { return JSON.parse(value); } catch { /* fall through */ }
  }
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
};

// Hydrate a raw DB row so arrays are real arrays (not JSON strings)
const hydrateRow = (row: any) => ({
  ...row,
  style:      parseJsonArray(row.style),
  fabrics:    parseJsonArray(row.fabrics),
  type:       row.type       ?? '',
  stitchType: row.stitchType ?? '',
  images:     parseJsonArray(row.images),
  createdAt:  row.created_at ?? null,
});

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const id  = url.searchParams.get('id');

  if (id) {
    const product = await context.env.DB.prepare(
      'SELECT * FROM collections WHERE id = ?'
    ).bind(id).first();
    if (!product) return Response.json(null, { status: 404 });
    return Response.json(hydrateRow(product));
  }

  const { results } = await context.env.DB.prepare(
    'SELECT * FROM collections ORDER BY created_at DESC'
  ).all();
  return Response.json((results ?? []).map(hydrateRow));
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = context.request.headers.get('Authorization');
  if (auth !== context.env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }

  const data: any = await context.request.json();
  const { name, price, description, image, images, style, fabrics, type, stitchType } = data;

  if (!name || !price || !image) {
    return new Response('Missing required fields', { status: 400 });
  }

  const imagesJson  = JSON.stringify(Array.isArray(images) ? images : [image]);
  const styleJson   = JSON.stringify(Array.isArray(style)   ? style   : []);
  const fabricsJson = JSON.stringify(Array.isArray(fabrics) ? fabrics : []);

  await context.env.DB.prepare(
    `INSERT INTO collections
      (name, price, description, image, images, style, fabrics, type, stitchType)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    name,
    price,
    description || '',
    image,
    imagesJson,
    styleJson,
    fabricsJson,
    type       || '',
    stitchType || ''
  ).run();

  return new Response('Created', { status: 201 });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const auth = context.request.headers.get('Authorization');
  if (auth !== context.env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(context.request.url);
  const id  = url.searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  const data: any = await context.request.json();
  const { name, price, description, image, images, style, fabrics, type, stitchType } = data;

  if (!name || !price || !image) {
    return new Response('Missing required fields', { status: 400 });
  }

  const imagesJson  = JSON.stringify(Array.isArray(images) ? images : [image]);
  const styleJson   = JSON.stringify(Array.isArray(style)   ? style   : []);
  const fabricsJson = JSON.stringify(Array.isArray(fabrics) ? fabrics : []);

  await context.env.DB.prepare(
    `UPDATE collections
     SET name = ?, price = ?, description = ?, image = ?, images = ?,
         style = ?, fabrics = ?, type = ?, stitchType = ?
     WHERE id = ?`
  ).bind(
    name,
    price,
    description || '',
    image,
    imagesJson,
    styleJson,
    fabricsJson,
    type       || '',
    stitchType || '',
    id
  ).run();

  return new Response('Updated', { status: 200 });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const auth = context.request.headers.get('Authorization');
  if (auth !== context.env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }
  const url = new URL(context.request.url);
  const id  = url.searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  await context.env.DB.prepare('DELETE FROM collections WHERE id = ?').bind(id).run();
  return new Response('Deleted', { status: 200 });
};
