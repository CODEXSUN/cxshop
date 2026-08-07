import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readLatestVersionedChangelogEntry(rootDir) {
  const changelogPath = join(rootDir, "assist", "documentation", "CHANGELOG.md");
  const changelog = readFileSync(changelogPath, "utf8");
  const match = changelog.match(/^### \[v (\d+\.\d+\.(\d+))\] .+? - (.+)$/mu);

  if (!match) {
    throw new Error("The changelog does not contain a versioned entry.");
  }

  return {
    reference: Number.parseInt(match[2], 10),
    title: match[3].trim(),
    version: match[1]
  };
}

export function formatChangelogCommitSubject(entry) {
  return `#${entry.reference} - ${entry.title}`;
}
