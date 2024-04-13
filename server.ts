import { loadSync } from "@std/dotenv";
import { Hono } from "hono";
import { discordRoute } from "./discord.ts";
import { logger, secureHeaders } from "hono/middleware";

loadSync({ export: true });

const app = new Hono();
app.use(secureHeaders());
app.use(logger());

app.route("/discord", discordRoute);

Deno.serve({ port: 8080 }, app.fetch);
