interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const contentType = context.request.headers.get("content-type") || "";
    
    let buffer: ArrayBuffer;
    let filename: string;
    let fileType: string;

    if (contentType.includes("multipart/form-data")) {
      // Handle traditional FormData
      const formData = await context.request.formData();
      const image = formData.get('image');

      if (!image || typeof image === 'string') {
        return Response.json({ 
          error: "No binary file detected in FormData. Try direct binary upload.",
          type: typeof image
        }, { status: 400 });
      }

      const file = image as unknown as File;
      buffer = await file.arrayBuffer();
      fileType = file.type || 'image/jpeg';
      filename = `${crypto.randomUUID()}-${file.name || 'image.jpg'}`;
    } else {
      // Handle Direct Binary Upload (more robust)
      buffer = await context.request.arrayBuffer();
      const xFilename = context.request.headers.get("X-Filename");
      filename = xFilename ? decodeURIComponent(xFilename) : `upload-${Date.now()}.jpg`;
      filename = `${crypto.randomUUID()}-${filename}`;
      fileType = contentType || 'image/jpeg';
    }

    if (buffer.byteLength === 0) {
      return Response.json({ error: "Received an empty file." }, { status: 400 });
    }

    // Upload to R2
    await context.env.BUCKET.put(filename, buffer, {
      httpMetadata: {
        contentType: fileType,
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
