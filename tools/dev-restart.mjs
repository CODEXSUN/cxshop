#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, statSync, watch } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const changeSettleMilliseconds = 1_200;
const unexpectedExitDelayMilliseconds = 1_500;
const serviceName = process.argv[2];
const services = {
  "platform-api": {
    label: "api",
    paths: [
      "apps/billing/api/src",
      "apps/blogs/api/src",
      "apps/core/api/src",
      "apps/devkit/api/src",
      "apps/ecommerce/api/src",
      "apps/mail/api/src",
      "apps/platform/api/src",
      "packages/framework/src",
      ".env"
    ]
  },
  "platform-web": {
    label: "web",
    paths: [
      "apps/billing/web/src",
      "apps/blogs/web/src",
      "apps/core/web/src",
      "apps/devkit/web/src",
      "apps/ecommerce/web/src",
      "apps/mail/web/src",
      "apps/platform/web/src",
      "packages/ui/src"
    ]
  }
};
const service = services[serviceName];

if (!service) {
  console.error(`Usage: node tools/dev-restart.mjs <${Object.keys(services).join("|")}>`);
  process.exit(1);
}

let child;
let debounceTimer;
let restartQueued = false;
let stopping = false;
let watchers = [];

start();
watchers = service.paths
  .filter((path) => existsSync(resolve(root, path)))
  .map((path) => {
    const absolutePath = resolve(root, path);
    return watch(
      absolutePath,
      { recursive: statSync(absolutePath).isDirectory() },
      (_event, filename) => queueRestart(filename)
    );
  });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    stopping = true;
    clearTimeout(debounceTimer);
    watchers.forEach((watcher) => watcher.close());
    await stop();
    process.exit(0);
  });
}

function start() {
  console.log(`\n[${service.label}] starting development service`);
  child = spawn(process.execPath, ["tools/preflight.mjs", serviceName], {
    cwd: root,
    env: { ...process.env, CXSHOP_DEV_SUPERVISED: "1" },
    stdio: "inherit"
  });
  child.once("exit", (code, signal) => {
    child = undefined;
    if (stopping || restartQueued) return;
    if (code === 75) {
      stopSupervisor("already running");
      return;
    }
    console.error(
      `[${service.label}] stopped (${signal ?? `code ${code ?? 1}`}); restarting shortly`
    );
    debounceTimer = setTimeout(start, unexpectedExitDelayMilliseconds);
  });
}

function stopSupervisor(reason) {
  stopping = true;
  clearTimeout(debounceTimer);
  watchers.forEach((watcher) => watcher.close());
  console.log(`[${service.label}] ${reason}; supervisor stopped`);
  process.exit(0);
}

function queueRestart(filename) {
  if (stopping || !isRelevant(filename)) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void restart(filename), changeSettleMilliseconds);
}

async function restart(filename) {
  restartQueued = true;
  console.log(`\n[${service.label}] change detected: ${filename ?? "source"}`);
  await stop();
  restartQueued = false;
  if (!stopping) start();
}

async function stop() {
  const activeChild = child;
  if (!activeChild?.pid) return;
  const exited = new Promise((resolveExit) => activeChild.once("exit", resolveExit));
  activeChild.kill("SIGTERM");
  await Promise.race([exited, delay(5_000)]);
  if (activeChild.exitCode === null && activeChild.signalCode === null) activeChild.kill("SIGKILL");
  await exited;
}

function isRelevant(filename) {
  const value = String(filename ?? "").replaceAll("\\", "/");
  if (!value) return true;
  if (value.includes("/node_modules/") || value.includes("/dist/") || value.includes("/.turbo/"))
    return false;
  return true;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}
