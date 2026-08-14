#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:net";

const root = resolve(import.meta.dirname, "..");
const app = process.argv[2];

const apps = {
  "platform-api": {
    displayName: "api",
    cwd: "apps/platform/api",
    envKey: "PLATFORM_API_PORT",
    host: "127.0.0.1",
    command: process.execPath,
    args:
      process.env.CXSHOP_DEV_SUPERVISED === "1"
        ? [nodePackageBin("tsx", "dist/cli.mjs"), "src/server.ts"]
        : [
            nodePackageBin("tsx", "dist/cli.mjs"),
            "watch",
            "--include",
            "../../../.env",
            "--exclude",
            "../../../dist/**/*",
            "src/server.ts"
          ]
  },
  "platform-web": {
    displayName: "web",
    cwd: "apps/platform/web",
    envKey: "PLATFORM_WEB_PORT",
    host: "127.0.0.1",
    command: process.execPath,
    args: [nodePackageBin("vite", "bin/vite.js"), "--strictPort"]
  }
};

if (!app || !apps[app]) {
  console.log(`Usage: node tools/preflight.mjs <${Object.keys(apps).join("|")}>`);
  process.exit(1);
}

const config = apps[app];
const env = loadDotEnv();
const port = parseRequiredPort(env[config.envKey], config.envKey);
const host = config.host;

if (app === "platform-web") {
  await waitForPlatformApi(parseRequiredPort(env.PLATFORM_API_PORT, "PLATFORM_API_PORT"));
}

await freePort(port, host);

if (app === "platform-api") {
  ensurePlatformApiDependencies();
}

const child = spawn(
  config.command,
  [...config.args, ...(app.endsWith("-web") ? ["--host", host, "--port", String(port)] : [])],
  {
    cwd: resolve(root, config.cwd),
    env: {
      ...process.env,
      // The API loads the root .env itself. Keeping those values out of the long-lived
      // watcher lets a child restart read fresh integration credentials after .env changes.
      ...(app === "platform-web" ? env : {}),
      ...(app === "platform-api"
        ? {
            CXSHOP_DB_FRESH_SESSION_FILE: join(
              tmpdir(),
              `cxshop-platform-fresh-${process.pid}.done`
            )
          }
        : {}),
      [config.envKey]: String(port)
    },
    stdio: "inherit"
  }
);

child.on("exit", (code) => process.exit(code ?? 0));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    stopChild(child, signal);
  });
}

function loadDotEnv() {
  const envPath = resolve(root, ".env");

  if (!existsSync(envPath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map((match) => [match[1].trim(), parseEnvValue(match[2])])
  );
}

function parseEnvValue(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return "";
  }

  const quote = trimmed[0];

  if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }

  return trimmed.replace(/\s+#.*$/, "").trim();
}

function parseRequiredPort(value, envKey) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    console.error(`  x Missing required port configuration: ${envKey}`);
    process.exit(1);
  }

  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    console.error(`  x Invalid port configuration for ${envKey}: ${raw}`);
    process.exit(1);
  }

  return port;
}

function ensurePlatformApiDependencies() {
  console.log("  - Checking API package builds");
  ensureWorkspacePackageBuild("@cxshop/framework", "packages/framework");
}

function ensureWorkspacePackageBuild(workspaceName, packagePath) {
  const absolutePackagePath = resolve(root, packagePath);
  const srcPath = join(absolutePackagePath, "src");
  const distPath = resolve(root, "dist", packagePath);
  const packageJsonPath = join(absolutePackagePath, "package.json");
  const tsconfigPath = join(absolutePackagePath, "tsconfig.json");

  if (!existsSync(distPath)) {
    buildWorkspacePackage(workspaceName, "dist missing");
    return;
  }

  const sourceTime = newestMtime([srcPath, packageJsonPath, tsconfigPath]);
  const distTime = newestMtime([distPath]);

  if (sourceTime > distTime) {
    buildWorkspacePackage(workspaceName, "source changed");
    return;
  }

  console.log(`  ok ${workspaceName} build is current`);
}

function buildWorkspacePackage(workspaceName, reason) {
  const startedAt = Date.now();
  console.log(`  build ${workspaceName} (${reason})`);
  runNpm(["run", "build", "-w", workspaceName]);
  console.log(`  ok ${workspaceName} built in ${Date.now() - startedAt}ms`);
}

function newestMtime(paths) {
  let newest = 0;
  for (const path of paths) {
    if (!existsSync(path)) {
      continue;
    }
    const stat = statSync(path);
    newest = Math.max(newest, stat.mtimeMs);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".turbo" || entry.name === "dist") {
          continue;
        }
        newest = Math.max(newest, newestMtime([join(path, entry.name)]));
      }
    }
  }
  return newest;
}

function runNpm(args) {
  if (process.env.npm_execpath) {
    execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
      cwd: root,
      stdio: "inherit"
    });
    return;
  }

  if (process.platform === "win32") {
    execFileSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", ["npm", ...args].join(" ")], {
      cwd: root,
      stdio: "inherit"
    });
    return;
  }

  execFileSync("npm", args, {
    cwd: root,
    stdio: "inherit"
  });
}

async function freePort(port, host) {
  console.log(`\n  > ${config.displayName} preflight`);
  console.log(`  - Checking ${host}:${port}`);

  if (await probePort(port, host)) {
    await waitForPortRelease();
    console.log(`  ok ${host}:${port} is ready\n`);
    return;
  }

  const pids = getPidsOnPort(port);

  if (!pids.length) {
    console.log(`  ok Port ${port} is ready (no blocking process found)\n`);
    return;
  }

  console.log(`  ! ${host}:${port} is already in use by PID ${pids.join(", ")}`);

  const portPolicy = process.env.CXSHOP_DEV_PORT_POLICY ?? env.CXSHOP_DEV_PORT_POLICY;
  if (portPolicy === "abort") {
    console.error(
      "  x Port policy is abort. Stop the existing process or change CXSHOP_DEV_PORT_POLICY.\n"
    );
    process.exit(1);
  }

  const stoppedPids = new Set(stopPortProcesses(pids));
  let consecutiveFreeChecks = 0;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await probePort(port, host)) {
      consecutiveFreeChecks += 1;
      if (consecutiveFreeChecks >= 8) {
        await waitForPortRelease();
        console.log(`  ok ${host}:${port} is ready\n`);
        return;
      }
    } else {
      consecutiveFreeChecks = 0;
      const reboundPids = getPidsOnPort(port);
      for (const pid of stopPortProcesses(reboundPids)) stoppedPids.add(pid);
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  console.error(
    `  x Port ${port} was not released after stopping PID ${[...stoppedPids].join(", ")}.\n`
  );
  process.exit(1);
}

function probePort(port, host) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close((error) => resolve(!error));
    });
    server.listen(port, host);
  });
}

function waitForPortRelease() {
  return new Promise((resolveWait) => setTimeout(resolveWait, 100));
}

async function waitForPlatformApi(apiPort) {
  const healthUrl = `http://127.0.0.1:${apiPort}/health`;
  const startedAt = Date.now();
  let lastStatus = "not reachable";
  let consecutiveReadyChecks = 0;
  const requiredReadyChecks = 5;

  console.log(`\n  - Waiting for Platform API to become stable at ${healthUrl}`);
  while (Date.now() - startedAt < 90_000) {
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(2_000) });
      lastStatus = `HTTP ${response.status}`;
      if (response.ok) {
        consecutiveReadyChecks += 1;
        if (consecutiveReadyChecks >= requiredReadyChecks) {
          console.log("  ok Platform API is fully loaded and stable");
          return;
        }
      } else {
        consecutiveReadyChecks = 0;
      }
    } catch (error) {
      consecutiveReadyChecks = 0;
      lastStatus = error instanceof Error ? error.message : String(error);
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }

  console.error(`  x Platform API did not become healthy: ${lastStatus}`);
  console.error("  x Start it separately with: npm run dev:api\n");
  process.exit(1);
}

function getPidsOnPort(port) {
  try {
    if (process.platform === "win32") {
      const out = execFileSync("netstat", ["-ano", "-p", "tcp"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      });

      return Array.from(
        new Set(
          out
            .split(/\r?\n/)
            .map((line) => line.trim().split(/\s+/))
            .filter(
              (parts) =>
                parts.length >= 5 && parts[3] === "LISTENING" && portFromAddress(parts[1]) === port
            )
            .map((parts) => Number(parts[4]))
            .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid)
        )
      );
    }

    const out = execFileSync("lsof", ["-ti", `:${port}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });

    return Array.from(
      new Set(
        out
          .split(/\s+/)
          .map(Number)
          .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid)
      )
    );
  } catch {
    return [];
  }
}

function portFromAddress(address) {
  const match = String(address).match(/:(\d+)$/);
  return match ? Number(match[1]) : null;
}

function killPid(pid) {
  if (process.platform === "win32") {
    execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    return;
  }

  process.kill(pid, "SIGTERM");
}

function stopPortProcesses(listenerPids) {
  const replacementTargets = new Map();
  for (const listenerPid of listenerPids) {
    const replacementPid = replacementProcessId(listenerPid);
    const listeners = replacementTargets.get(replacementPid) ?? [];
    listeners.push(listenerPid);
    replacementTargets.set(replacementPid, listeners);
  }
  const stoppedPids = [];
  for (const [pid, ownedListeners] of replacementTargets) {
    try {
      killPid(pid);
      stoppedPids.push(pid);
      const detail = ownedListeners.includes(pid)
        ? ""
        : ` (owns listener PID ${ownedListeners.join(", ")})`;
      console.log(`  ok Stopped PID ${pid}${detail}`);
    } catch {
      // The process can exit between the port scan and taskkill.
    }
  }
  return stoppedPids;
}

function replacementProcessId(listenerPid) {
  if (process.platform !== "win32") return listenerPid;
  let currentPid = listenerPid;
  let serviceSupervisorPid = listenerPid;
  for (let depth = 0; depth < 8; depth += 1) {
    const processInfo = windowsProcessInfo(currentPid);
    if (!processInfo) return listenerPid;
    const commandLine = processInfo.commandLine.replaceAll("\\", "/");
    if (
      commandLine.includes("tools/dev-restart.mjs") &&
      commandLine.includes(app)
    ) {
      serviceSupervisorPid = processInfo.processId;
    }
    if (commandLine.includes("tools/dev-stack.mjs")) return processInfo.processId;
    if (!processInfo.parentProcessId || processInfo.parentProcessId === currentPid) break;
    currentPid = processInfo.parentProcessId;
  }
  return serviceSupervisorPid;
}

function windowsProcessInfo(pid) {
  try {
    const command = `$process = Get-CimInstance Win32_Process -Filter "ProcessId=${pid}"; if ($process) { [pscustomobject]@{ processId=$process.ProcessId; parentProcessId=$process.ParentProcessId; commandLine=$process.CommandLine } | ConvertTo-Json -Compress }`;
    const output = execFileSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", command],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (!output) return null;
    const value = JSON.parse(output);
    return {
      commandLine: String(value.commandLine ?? ""),
      parentProcessId: Number(value.parentProcessId ?? 0),
      processId: Number(value.processId ?? pid)
    };
  } catch {
    return null;
  }
}

function stopChild(childProcess, signal) {
  if (childProcess.killed || !childProcess.pid) {
    return;
  }

  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/PID", String(childProcess.pid), "/T", "/F"], {
        stdio: ["ignore", "pipe", "pipe"]
      });
    } catch {
      childProcess.kill(signal);
    }
    return;
  }

  childProcess.kill(signal);
}

function nodePackageBin(packageName, binPath) {
  return resolve(root, "node_modules", packageName, binPath);
}
