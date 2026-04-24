interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    
    // Debug: What keys did we get?
    const keys = [...formData.keys()];
    
    // Find the first file-like object regardless of the key name
    let imageFile: File | null = null;
    for (const [key, value] of formData.entries()) {
      if (typeof value !== 'string') {
        imageFile = value as unknown as File;
        break;
      }
    }

    if (!imageFile) {
      return Response.json({ 
        error: "No binary file detected in the request.",
        receivedKeys: keys,
        contentType: context.request.headers.get("content-type")
      }, { status: 400 });
    }

    const filename = `${crypto.randomUUID()}-${imageFile.name || 'upload.jpg'}`;
    
    // Upload to R2
    await context.env.BUCKET.put(filename, await imageFile.arrayBuffer(), {
      httpMetadata: {
        contentType: imageFile.type || 'image/jpeg',
      }
    });

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
