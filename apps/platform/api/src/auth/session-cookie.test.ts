import assert from "node:assert/strict";
import test from "node:test";
import type { FastifyReply } from "fastify";
import {
  clearAllSessionCookies,
  decryptSessionCookie,
  encryptSessionCookie
} from "./session-cookie.js";

test("fresh login cleanup expires every current and legacy session cookie", () => {
  const cleared: string[] = [];
  const reply = {
    clearCookie(name: string) {
      cleared.push(name);
      return this;
    }
  } as unknown as FastifyReply;

  clearAllSessionCookies(reply);

  assert.deepEqual(cleared, [
    "cxshop_session",
    "cxshop_session_admin",
    "cxshop_session_sa",
    "cxshop_session_tenant",
    "__Host-cxshop_session"
  ]);
});

test("each fresh login cookie is unique and preserves only its new session token", () => {
  const first = encryptSessionCookie("first-session-token");
  const fresh = encryptSessionCookie("fresh-session-token");

  assert.notEqual(fresh, first);
  assert.equal(decryptSessionCookie(first), "first-session-token");
  assert.equal(decryptSessionCookie(fresh), "fresh-session-token");
});
