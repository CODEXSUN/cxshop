import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, parse, resolve } from "node:path";
import { AppError } from "@cxshop/framework/errors";
import { env } from "../../env.js";

const writableKeys = [
  "CXSHOP_DATA_SOURCE",
  "CXSHOP_FRAPPE_URL",
  "CXSHOP_FRAPPE_API_KEY",
  "CXSHOP_FRAPPE_API_SECRET"
] as const;
type EnvironmentUpdate = Partial<Record<(typeof writableKeys)[number], string>>;
let writeQueue = Promise.resolve();

export function updateDataSourceEnvironment(values: EnvironmentUpdate) {
  const operation = writeQueue.then(() => writeEnvironment(values));
  writeQueue = operation.catch(() => undefined);
  return operation;
}

async function writeEnvironment(values: EnvironmentUpdate) {
  const path = environmentPath();
  try {
    const current = await readCurrent(path);
    const ending = current.includes("\r\n") ? "\r\n" : "\n";
    const pending = new Map(Object.entries(values));
    const lines = current.split(/\r?\n/u).map((line) => {
      const key = writableKeys.find((candidate) => line.startsWith(`${candidate}=`));
      if (!key || !pending.has(key)) return line;
      const value = pending.get(key) ?? "";
      pending.delete(key);
      return lineFor(key, value);
    });
    if (lines.at(-1) === "") lines.pop();
    for (const [key, value] of pending) lines.push(lineFor(key, value));
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${lines.join(ending)}${ending}`, { encoding: "utf8", mode: 0o600 });
    Object.assign(env, values);
    Object.assign(process.env, values);
  } catch (error) {
    if (error instanceof AppError) throw error;
    const code =
      typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    throw new AppError({
      code: "DATA_SOURCE_ENV_SAVE_FAILED",
      message: ["EACCES", "EPERM", "EROFS"].includes(code)
        ? "The CXShop runtime .env file is read-only. The database settings were not changed."
        : "The CXShop Frappe settings could not be saved to .env.",
      statusCode: 500
    });
  }
}

function environmentPath() {
  if (env.CXSHOP_ENV_FILE_PATH.trim())
    return isAbsolute(env.CXSHOP_ENV_FILE_PATH)
      ? env.CXSHOP_ENV_FILE_PATH
      : resolve(process.cwd(), env.CXSHOP_ENV_FILE_PATH);
  let current = process.cwd();
  while (true) {
    const candidate = join(current, ".env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current || current === parse(current).root) return join(process.cwd(), ".env");
    current = parent;
  }
}

async function readCurrent(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")
      return "";
    throw error;
  }
}

function lineFor(key: string, value: string) {
  if (/\r|\n/u.test(value)) throw AppError.validation(`${key} must not contain line breaks.`);
  return value ? `${key}=${JSON.stringify(value)}` : `${key}=`;
}
