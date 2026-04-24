interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const image = formData.get('image');

    if (!image) {
      return Response.json({ 
        error: "Key 'image' not found in FormData.",
        availableKeys: [...formData.keys()]
      }, { status: 400 });
    }

    // In some environments, the file might be treated as a string or a Blob
    // We need to ensure we have something we can turn into an ArrayBuffer
    let buffer: ArrayBuffer;
    let contentType: string = 'image/jpeg';
    let filename: string = `upload-${Date.now()}.jpg`;

    if (typeof image === 'string') {
        return Response.json({ 
            error: "Received string instead of binary file. Ensure you are sending a File object.",
            stringPreview: image.substring(0, 100)
          }, { status: 400 });
    } else {
        // It's a File or Blob
        const file = image as unknown as File;
        buffer = await file.arrayBuffer();
        contentType = file.type || 'image/jpeg';
        filename = `${crypto.randomUUID()}-${file.name || 'image.jpg'}`;
    }

    if (buffer.byteLength === 0) {
        return Response.json({ error: "Received an empty file." }, { status: 400 });
    }

    // Upload to R2
    await context.env.BUCKET.put(filename, buffer, {
      httpMetadata: {
        contentType: contentType,
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
