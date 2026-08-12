import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  defaultTenantModuleKeys as apiDefaultTenantModuleKeys,
  resolveEnabledApps,
  resolveLandingApp
} from "../apps/platform/api/src/modules/app-registry/app-registry.service";
import {
  defaultTenantModuleKeys as webDefaultTenantModuleKeys,
  enabledAppIds
} from "../apps/platform/web/src/app/app-registry";

test("DevKit is never resolved as a tenant application", () => {
  assert.equal(apiDefaultTenantModuleKeys.includes("devkit" as never), false);
  assert.equal(webDefaultTenantModuleKeys.includes("devkit" as never), false);
  assert.equal(
    resolveEnabledApps(["devkit"]).some((app) => app.appId === "devkit"),
    false
  );
  assert.equal(resolveLandingApp("devkit", ["devkit"]), "application");
  assert.equal(enabledAppIds(["devkit"]).includes("devkit"), false);
});

test("tenant Admin exposes only the Honey DevKit surface", async () => {
  const [desk, registry, provisioning, host] = await Promise.all([
    readFile("apps/platform/web/src/desks/tenant/AppDesk.tsx", "utf8"),
    readFile("apps/platform/web/src/app/app-registry.ts", "utf8"),
    readFile("apps/platform/api/src/database/tenant-app-database.ts", "utf8"),
    readFile("apps/platform/api/src/devkit-host.ts", "utf8")
  ]);

  assert.match(desk, /DevkitWorkspaceHost workspaceId="honey"/);
  assert.match(registry, /title: "Honey AI"/);
  assert.doesNotMatch(desk, /workspaceId="registry"|\/app\/devkit\/registry/);
  assert.doesNotMatch(registry, /@cxshop\/devkit-web/);
  assert.doesNotMatch(provisioning, /@cxshop\/devkit-api|migrateDevkit|seedDevkit/);
  assert.match(host, /DevKit is available only to Super Admin\./);
  assert.match(host, /platform\.application\.honey\.access/);
});
