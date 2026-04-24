interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return Response.json({ error: "No image file provided" }, { status: 400 });
    }

    const filename = `${crypto.randomUUID()}-${imageFile.name}`;
    
    // Upload to R2
    await context.env.BUCKET.put(filename, imageFile.stream(), {
      httpMetadata: {
        contentType: imageFile.type,
      }
    });

    // The URL for the file (assuming you have set up a custom domain or use the default R2 subdomain)
    // For Cloudflare Pages, the simplest way is to create another API route to SERVE the file or 
    // connect a custom domain to your R2 bucket.
    const url = `/api/upload?key=${filename}`;

    return Response.json({ url });
  } catch (err: any) {
    console.error("R2 Upload Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  const object = await context.env.BUCKET.get(key);

  if (!object) {
    return new Response("Object not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, {
    headers,
  });
};
