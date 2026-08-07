#!/usr/bin/env node

import { copyFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { readEnvironmentFile, validateEnvironment } from "./env-contract.mjs";

const root = resolve(import.meta.dirname, "..");
const environmentPath = join(root, ".env");
const examplePath = join(root, ".env.example");
const checkOnly = process.argv.includes("--check");
const checkExample = process.argv.includes("--example");
const selectedPath = checkExample ? examplePath : environmentPath;

if (!checkExample && !existsSync(environmentPath)) {
  if (checkOnly) {
    console.error("Missing .env. Run npm run setup:base.");
    process.exit(1);
  }
  copyFileSync(examplePath, environmentPath);
  console.log("Created .env from .env.example.");
  console.log("Replace all placeholder secrets before shared or production use.");
}

const errors = validateEnvironment(readEnvironmentFile(selectedPath), {
  allowExamples: checkExample
});
if (errors.length) {
  console.error("CXShop environment validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`CXShop ${checkExample ? "example " : ""}environment validation passed.`);
