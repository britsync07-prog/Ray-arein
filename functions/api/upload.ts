interface Env {
  IMGBB_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.IMGBB_API_KEY) {
    return new Response("Server configuration error: IMGBB_API_KEY not set", { status: 500 });
  }

  try {
    const formData = await context.request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return new Response("No image file provided", { status: 400 });
    }

    // Prepare ImgBB request
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', imageFile);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${context.env.IMGBB_API_KEY}`, {
      method: 'POST',
      body: imgbbFormData
    });

    const result: any = await imgbbRes.json();

    if (result.success) {
      return Response.json({ url: result.data.url });
    } else {
      console.error("ImgBB Error:", result);
      return new Response("ImgBB upload failed", { status: 500 });
    }
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return new Response(err.message, { status: 500 });
  }
};
