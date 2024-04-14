import { loadSync } from "@std/dotenv";
import { Hono } from "hono";
import { discordRoute } from "./app/routes/discord.ts";
import { indexRoute } from "./app/routes/index.tsx";
import { logger, secureHeaders, serveStatic } from "hono/middleware";

loadSync({ export: true });

const app = new Hono();
app.use(secureHeaders());
app.use(logger());

app.use(serveStatic({ root: "./", path: "build" }));

app.route("/", indexRoute);
app.route("/discord", discordRoute);

Deno.serve({ port: 8080 }, app.fetch);
