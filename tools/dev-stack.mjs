import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const environmentFile = resolve(process.cwd(), ".env");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

const commands = ["dev:api", "dev:worker", "dev:web"];
const children = commands.map(command => spawn("npm.cmd", ["run", command], { stdio: "inherit", shell: false }));
const shutdown = () => children.forEach(child => child.kill("SIGTERM"));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
await Promise.all(children.map(child => new Promise((resolve, reject) => child.on("exit", code => code === 0 ? resolve() : reject(new Error(`${child.spawnargs.join(" ")} exited ${code}`))))));
