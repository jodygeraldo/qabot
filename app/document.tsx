/** @jsx jsx */
import { jsx } from "hono/middleware";
import type { PropsWithChildren } from "hono/jsx";

export function Layout(props: PropsWithChildren) {
  return (
    <html lang="en" class="bg-zinc-950 antialiased">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="output.css" />
      </head>
      <body>
        {props.children}
      </body>
    </html>
  );
}
