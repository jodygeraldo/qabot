import { loadSync } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
import { Hono } from "https://deno.land/x/hono@v4.1.5/mod.ts";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "npm:discord-interactions";
import {
  ASK_AI_COMMAND,
  QUESTION_COMMAND,
  QUESTION_SHORT_COMMAND,
} from "./commands.ts";

const env = loadSync();
const publicKey = env.PUBLIC_KEY;
const cfAccId = env.CF_ACC_ID;
const aiToken = env.AI_TOKEN;

const app = new Hono();

app.use(async (c, next) => {
  if (c.req.method === "POST") {
    const signature = c.req.header("x-signature-ed25519");
    const timestamp = c.req.header("x-signature-timestamp");
    const body = await c.req.raw.clone().arrayBuffer();
    const isValidRequest = verifyKey(body, signature, timestamp, publicKey);
    if (!isValidRequest) {
      return c.newResponse("Bad Request signature.", { status: 401 });
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

    if (
      commandName === QUESTION_COMMAND.name ||
      commandName === QUESTION_SHORT_COMMAND.name
    ) {
      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "hello world",
        },
      });
    }

    if (commandName === ASK_AI_COMMAND) {
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
          Authorization: `Bearer ${aiToken}`,
        },
        body: JSON.stringify([
          systemPromp,
          { role: "user", content: question },
        ]),
      });

      return c.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: await aiRes.text(),
        },
      });
    }
  }
});

Deno.serve({ port: 8080 }, app.fetch);
