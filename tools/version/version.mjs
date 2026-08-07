import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const packagePath = join(root, "package.json");
const changelogPath = join(root, "assist", "documentation", "CHANGELOG.md");
const [, , command = "show", ...args] = process.argv;

if (command === "show") {
  console.log(`CXShop version ${readPackage().version}`);
} else if (command === "append") {
  appendEntry();
} else {
  console.error(`Unknown version command: ${command}`);
  process.exit(1);
}

function readPackage() {
  return JSON.parse(readFileSync(packagePath, "utf8"));
}

function appendEntry() {
  const version = readPackage().version;
  const title = readArg("--title") ?? "Foundation progress";
  const note = readArg("--note") ?? "Updated the CXShop foundation.";
  const databaseUpdate = args.includes("--database-update") ? "Yes" : "No";
  const content = readFileSync(changelogPath, "utf8");
  const section = `## v-${version}`;
  if (!content.includes(section)) throw new Error(`Missing changelog section: ${section}`);
  const entry = [
    `### [v ${version}] ${localTimestamp()} - ${title}`,
    "",
    "#### Database Changes",
    "",
    `- Database update: ${databaseUpdate}.`,
    "",
    "#### App Codebase Changes",
    "",
    `- ${note}`,
    ""
  ].join("\n");
  writeFileSync(changelogPath, content.replace(section, `${section}\n\n${entry}`), "utf8");
  console.log(`Appended a changelog entry under ${section}.`);
}

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function localTimestamp() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Kolkata",
    year: "numeric"
  }).replace(",", "").replace("AM", "am").replace("PM", "pm");
}
