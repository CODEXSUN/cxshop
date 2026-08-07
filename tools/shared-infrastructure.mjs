#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import net from "node:net";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readEnvironmentFile, validateEnvironment } from "./env-contract.mjs";

export function validateSharedContract(environment) {
  const errors = validateEnvironment(environment);
  if (environment.INFRASTRUCTURE_MODE !== "cxapp-shared") {
    errors.push("INFRASTRUCTURE_MODE must be cxapp-shared.");
  }
  return errors;
}

async function main() {
  const root = resolve(import.meta.dirname, "..");
  const values = readEnvironmentFile(join(root, ".env"));
  const errors = validateSharedContract(values);
  if (errors.length) fail(errors);
  console.log("CXShop shared infrastructure contract passed.");
  if (process.argv.includes("--config-only")) return;
  if (values.SHARED_CREDENTIALS_READY !== "1") {
    throw new Error(
      "Shared credentials are not configured. Update the ignored .env and set SHARED_CREDENTIALS_READY=1."
    );
  }

  await checkTcp("MariaDB", values.DB_HOST, Number(values.DB_PORT));
  const redis = new URL(values.REDIS_URL);
  await checkTcp("Redis", redis.hostname, Number(redis.port || 6379));
  const media = new URL(values.FILEBROWSER_URL);
  await checkTcp("FileBrowser", media.hostname, Number(media.port || 80));
  checkDockerResource("network", values.SHARED_DOCKER_NETWORK);
  checkDockerResource("container", "cxapp-mariadb");
  checkDockerResource("container", "cxapp-redis");
  checkDockerResource("container", "cxapp-media");
  checkDockerResource("volume", values.SHARED_MEDIA_VOLUME);
  console.log("CXShop shared infrastructure is reachable.");
}

function checkTcp(label, host, port) {
  return new Promise((resolveCheck, rejectCheck) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(3000);
    socket.once("connect", () => {
      socket.destroy();
      console.log(`${label} TCP endpoint is reachable at ${host}:${port}.`);
      resolveCheck();
    });
    socket.once("timeout", () => socket.destroy(new Error(`${label} connection timed out.`)));
    socket.once("error", rejectCheck);
  });
}

function checkDockerResource(type, name) {
  execFileSync("docker", [type, "inspect", name], { stdio: "ignore" });
  console.log(`External Docker ${type} exists: ${name}.`);
}

function fail(messages) {
  console.error("Shared infrastructure validation failed:");
  messages.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
