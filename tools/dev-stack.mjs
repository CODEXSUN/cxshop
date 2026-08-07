import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const environmentFile = resolve(process.cwd(), ".env");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

const children = [];
const api = start("dev:api");
children.push(api);

try {
  await waitForApi(api);
  children.push(start("dev:worker"), start("dev:web"));
  await Promise.all(children.map(waitForExit));
} catch (error) {
  shutdown();
  throw error;
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function start(command) {
  return spawn("npm.cmd", ["run", command], { stdio: "inherit", shell: false });
}

async function waitForApi(child) {
  const origin = process.env.API_URL;
  if (!origin) throw new Error("API_URL is required");
  for (let attempt = 1; attempt <= 120; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`API startup exited with code ${child.exitCode}`);
    const response = await fetch(`${origin}/health`).catch(() => undefined);
    if (response?.ok) {
      console.info(`[dev.ready] API ready after ${attempt} check(s). Starting worker and Turbopack.`);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error("API startup did not become ready within 60 seconds");
}

function waitForExit(child) {
  return new Promise((resolve, reject) => child.on("exit", code => code === 0 ? resolve() : reject(new Error(`${child.spawnargs.join(" ")} exited ${code}`))));
}

function shutdown() {
  for (const child of children) if (child.exitCode === null) child.kill("SIGTERM");
}
