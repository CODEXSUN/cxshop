#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const rootNodeModules = join(root, "node_modules");

if (!existsSync(rootNodeModules)) {
  console.error("Root node_modules is missing. Run npm install from the repository root.");
  process.exit(1);
}

console.log("Dependency layout verified: root dependencies are installed");
