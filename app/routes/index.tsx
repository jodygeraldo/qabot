/** @jsx jsx */
import { Hono } from "hono";
import { jsx } from "hono/middleware";
import type { PropsWithChildren } from "hono/jsx";
import { Layout } from "../document.tsx";

const app = new Hono();

app.get((c) => {
  return c.html(
    <Layout>
      Todo
    </Layout>,
  );
});

export { app as indexRoute };
