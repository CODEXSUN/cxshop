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

test("accepts the development localhost CORS preflight", async () => {
  const { app } = await createApp();
  const response = await app.inject({
    method: "OPTIONS",
    url: "/v1/auth/development-login",
    headers: {
      origin: "http://localhost:7520",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type"
    }
  });
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:7520");
  assert.match(String(response.headers["access-control-allow-methods"]), /OPTIONS/u);
  assert.equal(response.headers["access-control-allow-credentials"], "true");
  await app.close();
});
