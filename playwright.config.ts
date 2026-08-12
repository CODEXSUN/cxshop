import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tools/e2e",
  testMatch: "storefront-catalog.playwright.ts",
  timeout: 30_000,
  use: {
    baseURL: process.env.CXSHOP_E2E_WEB_URL ?? "http://127.0.0.1:8020",
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  }
});
