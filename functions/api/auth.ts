interface Env {
  ADMIN_PASSWORD?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { password } = await context.request.json() as { password?: string };
  
  if (!context.env.ADMIN_PASSWORD) {
      return new Response("Server configuration error: ADMIN_PASSWORD not set", { status: 500 });
  }

  if (password === context.env.ADMIN_PASSWORD) {
    return new Response("Success", { status: 200 });
  } else {
    return new Response("Invalid password", { status: 401 });
  }
};
