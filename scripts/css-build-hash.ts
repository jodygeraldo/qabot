import { crypto } from "@std/crypto";
import { parseArgs } from "@std/cli";
import { assert } from "@std/assert";
import * as path from "@std/path";
import * as fs from "@std/fs";

const args = parseArgs(Deno.args);
assert(typeof args.input === "string", "Missing --input argument");
assert(typeof args.outDir === "string", "Missing --outDir argument");
assert(typeof args.document === "string", "Missing --document argument");

const data = Deno.readFileSync(args.input);
const hashHex = await hash(data);

const filename = path.parse(args.input);
const outFilename = `${filename.name}-${hashHex}${filename.ext}`;
const outFile = path.join(args.outDir, outFilename);

fs.ensureDirSync(args.outDir);
Deno.renameSync(args.input, outFile);

const document = Deno.readTextFileSync(args.document);
const newDocument = document.replace("output.css", outFilename);
Deno.writeTextFileSync(args.document, newDocument);

async function hash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("FNV32", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
