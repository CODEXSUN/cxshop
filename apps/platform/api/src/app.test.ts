import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "./app";

process.env.DB_PASSWORD = "test-password";
process.env.LOGIN_SECRET = "test-secret-with-at-least-thirty-two-characters";

test("exposes constrained GraphQL service query", async () => {
  const { app } = await createApp();
  const response = await app.inject({ method: "POST", url: "/graphql", payload: { query: "{ service { name status } }" } });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { data: { service: { name: "cxshop-api", status: "ok" } } });
  await app.close();
});

test("publishes OpenAPI and Scalar documentation", async () => {
  const { app } = await createApp();
  const openApi = await app.inject({ method: "GET", url: "/openapi.json" });
  const docs = await app.inject({ method: "GET", url: "/docs" });
  assert.equal(openApi.statusCode, 200);
  assert.ok([200, 301, 302].includes(docs.statusCode));
  await app.close();
});
