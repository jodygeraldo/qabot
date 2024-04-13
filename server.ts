import { loadSync } from "@std/dotenv";
import { Hono } from "hono";
import { discordRoute } from "./discord.ts";

loadSync({ export: true });

const app = new Hono();

app.route("/discord", discordRoute);

Deno.serve({ port: 8080 }, app.fetch);
