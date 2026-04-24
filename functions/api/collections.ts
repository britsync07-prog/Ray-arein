interface Env {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    "SELECT * FROM collections ORDER BY created_at DESC"
  ).all();
  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = context.request.headers.get("Authorization");
  if (auth !== context.env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data: any = await context.request.json();
  const { name, price, description, image } = data;

  if (!name || !price || !image) {
    return new Response("Missing required fields", { status: 400 });
  }

  await context.env.DB.prepare(
    "INSERT INTO collections (name, price, description, image) VALUES (?, ?, ?, ?)"
  ).bind(name, price, description || "", image).run();

  return new Response("Created", { status: 201 });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const auth = context.request.headers.get("Authorization");
    if (auth !== context.env.ADMIN_PASSWORD) {
      return new Response("Unauthorized", { status: 401 });
    }
  
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
  
    if (!id) {
      return new Response("Missing id", { status: 400 });
    }
  
    await context.env.DB.prepare("DELETE FROM collections WHERE id = ?").bind(id).run();
    return new Response("Deleted", { status: 200 });
};
