import assert from "node:assert/strict";
import test from "node:test";
import { canTransition } from "./walk-in-order";

test("walk-in order follows the manual collection path", () => {
  assert.equal(canTransition("confirmed", "billed"), true);
  assert.equal(canTransition("billed", "ready_for_collection"), true);
  assert.equal(canTransition("ready_for_collection", "collected"), true);
});

test("walk-in order rejects skipped and terminal transitions", () => {
  assert.equal(canTransition("confirmed", "collected"), false);
  assert.equal(canTransition("collected", "cancelled"), false);
  assert.equal(canTransition("cancelled", "confirmed"), false);
});
