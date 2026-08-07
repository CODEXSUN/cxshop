import assert from "node:assert/strict";
import test from "node:test";
import { readEnvironmentFile, validateEnvironment } from "./env-contract.mjs";

const exampleEnvironment = readEnvironmentFile(new URL("../.env.example", import.meta.url));
const validEnvironment = {
  ...exampleEnvironment,
  DB_PASSWORD: "local-database-password-for-tests",
  OBJECT_STORAGE_ACCESS_KEY: "local-storage-access-for-tests",
  OBJECT_STORAGE_SECRET_KEY: "local-storage-secret-for-tests",
  LOGIN_SECRET: "local-session-secret-with-more-than-32-characters",
  DEV_LOGIN_PASSWORD: "local-seed-password-for-tests"
};

test("the tracked environment example has a valid contract", () => {
  assert.deepEqual(validateEnvironment(exampleEnvironment, { allowExamples: true }), []);
});

test("a configured local environment is valid", () => {
  assert.deepEqual(validateEnvironment(validEnvironment), []);
});

test("duplicate API and web ports are rejected", () => {
  const values = { ...validEnvironment, WEB_PORT: validEnvironment.API_PORT };
  assert.match(validateEnvironment(values).join("\n"), /ports must be unique/u);
});

test("enabled Frappe integration requires credentials", () => {
  const values = { ...validEnvironment, FRAPPE_ENABLED: "1" };
  assert.match(validateEnvironment(values).join("\n"), /FRAPPE_BASE_URL/u);
});

test("enabled OpenAI integration requires an API key", () => {
  const values = { ...validEnvironment, OPENAI_ENABLED: "1", OPENAI_API_KEY: "" };
  assert.match(validateEnvironment(values).join("\n"), /OPENAI_API_KEY/u);
});
