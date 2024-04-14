import { assertExists } from "@std/assert";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { Hono } from "hono";
import { ASK_AI_COMMAND } from "../lib/discord-commands.ts";

const publicKey = Deno.env.get("PUBLIC_KEY");
const cfAccId = Deno.env.get("CF_ACC_ID");
const aiToken = Deno.env.get("AI_TOKEN");
assertExists(publicKey, "Missing Discord PUBLIC_KEY env");
assertExists(cfAccId, "Missing Cloudflare ACC_ID env");
assertExists(aiToken, "Missing Cloudflare AI_TOKEN env");

const app = new Hono();

app.use(async (c, next) => {
  if (c.req.method === "POST") {
    const signature = c.req.header("x-signature-ed25519");
    const timestamp = c.req.header("x-signature-timestamp");
    const body = await c.req.raw.clone().arrayBuffer();

    const badRequest = c.newResponse("Bad Request signature.", { status: 401 });
    if (!(signature && timestamp)) {
      return badRequest;
    }

    const isValidRequest = verifyKey(body, signature, timestamp, publicKey);
    if (!isValidRequest) {
      return badRequest;
    }
  }

  await next();
});

app.post("/interactions", async (c) => {
  const interaction = await c.req.json();

  if (interaction.type === InteractionType.PING) {
    return c.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data.name.toLowerCase();

    if (commandName === ASK_AI_COMMAND.name) {
      const model = "@hf/thebloke/openhermes-2.5-mistral-7b-awq";
      const aiUrl =
        `https://api.cloudflare.com/client/v4/accounts/${cfAccId}/ai/run/${model}`;

      const systemPromp = {
        role: "system",
        content: "Exact words answer, do not explain!",
      };

      const question = interaction.data.options[0].value;

      const aiRes = await fetch(aiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiToken}`,
        },
        body: JSON.stringify({
          messages: [
            systemPromp,
            { role: "user", content: question },
          ],
        }),
      });

      const answer = (await aiRes.json()).result.response;

      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: answer,
        },
      });
    }
  }
});

export { app as discordRoute };
