import assert from "node:assert/strict";
import test from "node:test";
import { readEnvironmentFile } from "./env-contract.mjs";
import { validateSharedContract } from "./shared-infrastructure.mjs";

const environment = readEnvironmentFile(new URL("../.env", import.meta.url));

test("the local environment uses isolated shared-resource scopes", () => {
  assert.deepEqual(validateSharedContract(environment), []);
});

test("the CXApp database cannot be selected", () => {
  const invalid = { ...environment, DB_NAME: "cxapp_db" };
  assert.match(validateSharedContract(invalid).join("\n"), /cxshop-owned database/u);
});

test("the shared Redis database index cannot be zero", () => {
  const invalid = { ...environment, REDIS_URL: environment.REDIS_URL.replace(/\/2$/u, "/0") };
  assert.match(validateSharedContract(invalid).join("\n"), /database index 2/u);
});
