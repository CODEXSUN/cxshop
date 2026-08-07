#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { formatChangelogCommitSubject, readLatestVersionedChangelogEntry } from "./changelog.mjs";

const root = resolve(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const entry = readLatestVersionedChangelogEntry(root);
const defaultSubject = formatChangelogCommitSubject(entry);
const status = runGit(["status", "--short"], true);

console.log(`Version: ${entry.version}`);
console.log(`Subject: ${defaultSubject}`);
console.log(status || "No uncommitted files.");

if (dryRun) {
  console.log("Dry run only. No Git changes were made.");
  process.exit(0);
}

if (!input.isTTY || !output.isTTY) {
  throw new Error("github:now requires an interactive terminal. Use --dry-run for review.");
}

const prompt = createInterface({ input, output });
try {
  const answer = (await prompt.question(`Commit message [${defaultSubject}]: `)).trim();
  const subject = answer || defaultSubject;
  const confirmation = (await prompt.question("Run pull, stage, commit, and push? [y/N]: ")).trim().toLowerCase();
  if (!["y", "yes"].includes(confirmation)) throw new Error("Cancelled before Git changes.");
  runGit(["pull", "--rebase", "--autostash"]);
  runGit(["add", "-A"]);
  runGit(["commit", "-m", subject]);
  runGit(["push"]);
  console.log(`Pushed: ${subject}`);
} finally {
  prompt.close();
}

function runGit(args, silent = false) {
  const result = execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: silent ? ["ignore", "pipe", "inherit"] : "inherit"
  });
  return typeof result === "string" ? result.trim() : "";
}
