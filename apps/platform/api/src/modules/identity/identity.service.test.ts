import assert from "node:assert/strict";
import test from "node:test";
import type { Portal } from "@cxshop/contracts";
import type { IdentityRepository, LoginIdentity } from "./identity.repository";
import { IdentityService } from "./identity.service";

const identity: LoginIdentity = {
  id: "1e9980b2-c719-46f7-bd7f-70594a8ad671",
  email: "vendor@cxshop.local",
  displayName: "Demo Vendor",
  passwordHash: "unused",
  portal: "vendor",
  permissions: ["vendor.dashboard.read"],
  vendorId: "676028e0-3e30-4cbb-a790-014383c84774"
};

const repository = {
  findForLogin: async (email: string, portal: Portal) => email === identity.email && portal === identity.portal ? identity : undefined,
  toSession: (value: LoginIdentity) => ({ actorId: value.id, email: value.email, displayName: value.displayName, portal: value.portal, permissions: value.permissions, vendorId: value.vendorId })
} as IdentityRepository;

const development = {
  NODE_ENV: "development",
  DEV_LOGIN_AUTO: "1" as const,
  DEV_LOGIN_STORE_EMAIL: "customer@cxshop.local",
  DEV_LOGIN_VENDOR_EMAIL: identity.email,
  DEV_LOGIN_ADMIN_EMAIL: "admin@cxshop.local",
  DEV_LOGIN_SA_EMAIL: "sa@cxshop.local",
  LOGIN_SESSION_HOURS: 8
};

test("development login uses configured persisted portal identity", async () => {
  const service = new IdentityService(repository, "test-secret-with-at-least-thirty-two-characters", development);
  const token = await service.developmentLogin({ portal: "vendor" });
  assert.ok(token);
  const session = await service.verify(token, "vendor");
  assert.equal(session?.vendorId, identity.vendorId);
  assert.equal(await service.verify(token, "admin"), undefined);
});

test("production cannot use development login", async () => {
  const service = new IdentityService(repository, "test-secret-with-at-least-thirty-two-characters", { ...development, NODE_ENV: "production" });
  assert.equal(await service.developmentLogin({ portal: "vendor" }), undefined);
});
