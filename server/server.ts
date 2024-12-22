import "jsr:@std/dotenv/load";
import fetch from "node-fetch";
import Fastify from 'fastify'

const app = Fastify();

if (!Deno.env.has("VITE_DISCORD_CLIENT_ID")) {
    throw new Error("VITE_DISCORD_CLIENT_ID is required");
}

if (!Deno.env.has("DISCORD_CLIENT_SECRET")) {
    throw new Error("DISCORD_CLIENT_SECRET is required");
}

app.post("/api/token", async (req, res) => {
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: Deno.env.get("VITE_DISCORD_CLIENT_ID")!,
      client_secret: Deno.env.get("DISCORD_CLIENT_SECRET")!,
      grant_type: "authorization_code",
      code: (req.body as { code: string }).code,
    }),
  });

  const json = await response.text();
  const parsed = JSON.parse(json);
  const { access_token } = parsed;

  res.send({ access_token });
});

app.listen({ port: 5417 }, () => {
  console.log("Server listening on http://localhost:5417");
});