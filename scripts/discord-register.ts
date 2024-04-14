import { loadSync } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
import { ASK_AI_COMMAND } from "../app/lib/discord-commands.ts";

const env = loadSync();
const appId = env.APP_ID;
const botToken = env.BOT_TOKEN;

const apiVersion = 10;
const discordApiUrl =
  `https://discord.com/api/v${apiVersion}/applications/${appId}/commands`;

const response = await fetch(discordApiUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${botToken}`,
  },
  body: JSON.stringify([ASK_AI_COMMAND]),
});

if (response.ok) {
  console.log("Registered all commands");
} else {
  console.error("Error registering commands");
  const text = await response.text();
  console.error(text);
}
