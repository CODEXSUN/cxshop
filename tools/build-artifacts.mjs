import { readdir, rm } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = ["apps", "packages", "tools"];
const generatedNames = new Set([".next", "dist", "dist-types"]);

async function findNestedArtifacts() {
  const artifacts = [];
  for (const sourceRoot of sourceRoots) {
    await visit(resolve(repositoryRoot, sourceRoot), artifacts);
  }
  return artifacts.sort();
}

async function visit(directory, artifacts) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "node_modules") continue;
    const target = resolve(directory, entry.name);
    if (generatedNames.has(entry.name)) {
      artifacts.push(target);
      continue;
    }
    await visit(target, artifacts);
  }
}

function assertSafe(target) {
  const localPath = relative(repositoryRoot, target);
  if (!localPath || localPath.startsWith(`..${sep}`) || localPath === "..") {
    throw new Error(`Refusing unsafe artifact path: ${target}`);
  }
}

async function clean() {
  const targets = [
    resolve(repositoryRoot, ".next"),
    resolve(repositoryRoot, "dist"),
    ...(await findNestedArtifacts())
  ];
  for (const target of targets) {
    assertSafe(target);
    await rm(target, { recursive: true, force: true });
  }
  console.log(`Removed ${targets.length} generated artifact locations.`);
}

async function check() {
  const artifacts = await findNestedArtifacts();
  if (artifacts.length === 0) {
    console.log("Build artifacts are root-owned.");
    return;
  }
  const paths = artifacts.map(path => relative(repositoryRoot, path)).join("\n- ");
  throw new Error(`Nested build artifacts are forbidden:\n- ${paths}`);
}

const command = process.argv[2];
if (command === "clean") await clean();
else if (command === "check") await check();
else throw new Error("Usage: node tools/build-artifacts.mjs <clean|check>");
