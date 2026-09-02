import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../client/index.html", import.meta.url), "utf8");
const match = html.match(/<title>([^<]+)<\/title>/i);
if (!match) throw new Error("Title tag not found");
const title = match[1].trim();
const count = [...title].length;
console.log(JSON.stringify({ title, characters: count, valid: count >= 30 && count <= 60 }, null, 2));
if (count < 30 || count > 60) process.exit(1);
