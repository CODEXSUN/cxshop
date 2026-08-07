#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(import.meta.dirname, "..");

export function bumpNextVersion(rootDir, title = "version update", options = {}) {
  const currentVersion = readRootVersion(rootDir);
  const nextVersion = bumpPatch(currentVersion);
  const databaseUpdate = resolveDatabaseUpdate(rootDir, options.databaseUpdate);
  const packageFiles = findWorkspacePackageFiles(rootDir);

  for (const file of packageFiles) {
    updatePackageVersion(file, currentVersion, nextVersion);
  }

  updatePackageLock(rootDir, packageFiles, currentVersion, nextVersion);
  updateDeploymentSample(rootDir, nextVersion);
  updateChangelog(rootDir, nextVersion, title, databaseUpdate);

  return { currentVersion, databaseUpdate, nextVersion, title };
}

export function findWorkspacePackageFiles(rootDir) {
  const rootPackagePath = resolve(rootDir, "package.json");
  const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf8"));
  const files = new Set([rootPackagePath]);

  for (const pattern of rootPackage.workspaces ?? []) {
    for (const workspaceDir of expandWorkspacePattern(rootDir, pattern)) {
      const packagePath = join(workspaceDir, "package.json");
      if (existsSync(packagePath)) files.add(packagePath);
    }
  }

  return [...files].sort();
}

export function bumpPatch(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/u);
  if (!match) throw new Error(`Unsupported version format: ${version}`);
  return `${match[1]}.${match[2]}.${Number.parseInt(match[3], 10) + 1}`;
}

function expandWorkspacePattern(rootDir, pattern) {
  let directories = [rootDir];

  for (const part of pattern.split(/[\\/]/u).filter(Boolean)) {
    const nextDirectories = [];
    for (const directory of directories) {
      if (part === "*") {
        if (!existsSync(directory)) continue;
        for (const entry of readdirSync(directory)) {
          const candidate = join(directory, entry);
          if (statSync(candidate).isDirectory()) nextDirectories.push(candidate);
        }
      } else {
        const candidate = join(directory, part);
        if (existsSync(candidate) && statSync(candidate).isDirectory()) {
          nextDirectories.push(candidate);
        }
      }
    }
    directories = nextDirectories;
  }

  return directories;
}

function readRootVersion(rootDir) {
  return String(JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8")).version);
}

function updatePackageVersion(file, currentVersion, nextVersion) {
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  pkg.version = nextVersion;
  updateInternalDependencies(pkg, currentVersion, nextVersion);
  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

function updateInternalDependencies(pkg, currentVersion, nextVersion) {
  for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [name, version] of Object.entries(pkg[field] ?? {})) {
      if (name.startsWith("@cxshop/") && version === `^${currentVersion}`) {
        pkg[field][name] = `^${nextVersion}`;
      }
    }
  }
}

function updatePackageLock(rootDir, packageFiles, currentVersion, nextVersion) {
  const file = resolve(rootDir, "package-lock.json");
  if (!existsSync(file)) return;

  const lock = JSON.parse(readFileSync(file, "utf8"));
  const workspacePaths = new Set(
    packageFiles.map((filePath) => relative(rootDir, dirname(filePath)).replaceAll("\\", "/"))
  );

  if (lock.version === currentVersion) lock.version = nextVersion;
  for (const [lockPath, pkg] of Object.entries(lock.packages ?? {})) {
    if (pkg?.version === currentVersion && (lockPath === "" || workspacePaths.has(lockPath))) {
      pkg.version = nextVersion;
    }
    if (pkg && typeof pkg === "object") updateInternalDependencies(pkg, currentVersion, nextVersion);
  }
  writeFileSync(file, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
}

function updateDeploymentSample(rootDir, nextVersion) {
  const file = resolve(rootDir, ".container", "deploy.env.sample");
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf8").replace(/^APP_VERSION=.*$/mu, `APP_VERSION=${nextVersion}`);
  writeFileSync(file, content, "utf8");
}

function updateChangelog(rootDir, nextVersion, title, databaseUpdate) {
  const file = resolve(rootDir, "assist", "documentation", "CHANGELOG.md");
  let content = readFileSync(file, "utf8")
    .replace(/Current version: .*/u, `Current version: ${nextVersion}`)
    .replace(/Release tag: .*/u, `Release tag: v-${nextVersion}`)
    .replace(/Changelog label: .*/u, `Changelog label: v ${nextVersion}`);
  const entry = [
    `## v-${nextVersion}`,
    "",
    `### [v ${nextVersion}] ${formatLocalTimestamp(new Date())} - ${title}`,
    "",
    "#### Database Changes",
    "",
    `- Database update: ${databaseUpdate.hasUpdate ? "Yes" : "No"} (${databaseUpdate.mode}).`,
    "",
    "#### App Codebase Changes",
    "",
    `- Bumped the workspace version to ${nextVersion}.`,
    ""
  ].join("\n");
  const marker = content.indexOf("## v-");
  const insertionPoint = marker === -1 ? content.length : marker;
  content = `${content.slice(0, insertionPoint)}${entry}\n${content.slice(insertionPoint)}`;
  writeFileSync(file, content, "utf8");
}

function formatLocalTimestamp(date) {
  const hours = date.getHours();
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ];
  return `${parts.join("-")} ${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${hours >= 12 ? "pm" : "am"}`;
}

function resolveDatabaseUpdate(rootDir, requested) {
  if (typeof requested === "boolean") return { hasUpdate: requested, mode: "manual" };
  const files = changedFiles(rootDir).filter(isDatabaseFile);
  return { hasUpdate: files.length > 0, mode: "auto" };
}

function changedFiles(rootDir) {
  try {
    return execFileSync("git", ["diff", "--name-only", "HEAD", "--"], {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).split(/\r?\n/u).filter(Boolean);
  } catch {
    return [];
  }
}

function isDatabaseFile(file) {
  const name = file.replaceAll("\\", "/").toLowerCase();
  return name.includes("/database/") || name.includes("/migrations/") || name.endsWith(".migration.ts") || name.endsWith(".schema.sql");
}

function parseDatabaseFlag(args) {
  if (args.includes("--database-update")) return true;
  if (args.includes("--no-database-update")) return false;
  return undefined;
}

function parseTitle(args) {
  const index = args.findIndex((arg) => arg === "--title" || arg === "-t");
  return index >= 0 ? args[index + 1] ?? "version update" : "version update";
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const result = bumpNextVersion(ROOT, parseTitle(args), { databaseUpdate: parseDatabaseFlag(args) });
  console.log(`Bumped ${result.currentVersion} -> ${result.nextVersion}`);
  console.log(`Database update: ${result.databaseUpdate.hasUpdate ? "yes" : "no"} (${result.databaseUpdate.mode})`);
}
