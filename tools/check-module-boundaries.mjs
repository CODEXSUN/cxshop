import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1));
const violations = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const text = await readFile(path, "utf8");
      if (/modules\/[\w-]+\/(?:repository|persistence)/.test(text)) violations.push(relative(root, path));
      if (/E:\\Workspace\\codexsun\\cxapp/.test(text)) violations.push(relative(root, path));
    }
  }
}
await walk(join(root, "apps"));
if (violations.length) { console.error("Module boundary violations:", violations); process.exit(1); }
console.log("CXShop module boundary check passed.");
