#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { findWorkspacePackageFiles } from "./version-bump.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const rootVersion = String(readJson(join(ROOT, "package.json")).version);
const failures = [];

for (const file of findWorkspacePackageFiles(ROOT)) {
  const version = String(readJson(file).version);
  if (version !== rootVersion) failures.push(`${relative(ROOT, file)} is ${version}. Expected ${rootVersion}.`);
}

const lockPath = join(ROOT, "package-lock.json");
if (existsSync(lockPath)) {
  const lock = readJson(lockPath);
  if (String(lock.version) !== rootVersion) failures.push("The package-lock version does not match the root version.");
  if (String(lock.packages?.[""]?.version) !== rootVersion) failures.push("The package-lock root package does not match the root version.");
}

const changelog = readFileSync(join(ROOT, "assist", "documentation", "CHANGELOG.md"), "utf8");
for (const expected of [
  `Current version: ${rootVersion}`,
  `Release tag: v-${rootVersion}`,
  `Changelog label: v ${rootVersion}`,
  `## v-${rootVersion}`
]) {
  if (!changelog.includes(expected)) failures.push(`The changelog is missing: ${expected}`);
}

const deploySample = readFileSync(join(ROOT, ".container", "deploy.env.sample"), "utf8");
if (!deploySample.includes(`APP_VERSION=${rootVersion}`)) {
  failures.push(`The deployment sample version must be ${rootVersion}.`);
}

if (failures.length) {
  console.error(`Version check failed for ${rootVersion}:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Version check passed for ${rootVersion}.`);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}
