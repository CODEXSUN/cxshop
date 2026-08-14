import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("the combined launcher uses configured ports", async () => {
  const source = await read("tools/dev-stack.mjs");

  assert.match(source, /env\.PLATFORM_API_PORT/u);
  assert.match(source, /env\.PLATFORM_WEB_PORT/u);
  assert.doesNotMatch(source, /127\.0\.0\.1:7010/u);
  assert.doesNotMatch(source, /127\.0\.0\.1:7020/u);
});

test("preflight protects development ports and replaces production listeners", async () => {
  const source = await read("tools/preflight.mjs");

  assert.match(source, /CXSHOP_DEV_PORT_POLICY/u);
  assert.match(source, /nodeEnvironment === "production" \? "replace" : "abort"/u);
  assert.match(source, /portPolicy !== "replace"/u);
  assert.match(source, /Existing development service keeps ownership of this port/u);
  assert.match(source, /process\.exit\(75\)/u);
});

test("a duplicate development supervisor exits without retrying", async () => {
  const source = await read("tools/dev-restart.mjs");

  assert.match(source, /if \(code === 75\)/u);
  assert.match(source, /stopSupervisor\("already running"\)/u);
});

test("the combined launcher accepts clean duplicate supervisor exits", async () => {
  const source = await read("tools/dev-stack.mjs");

  assert.match(source, /if \(exitCode === 0\)/u);
  assert.match(source, /supervisor not required/u);
  assert.match(source, /exitWhenExistingStackNeedsNoSupervisor\(\)/u);
  assert.match(source, /if \(!stackReady \|\| children\.size > 0\) return/u);
  assert.match(source, /Existing development stack remains active/u);
});

test("web waits for stable API readiness and file changes settle before restart", async () => {
  const preflight = await read("tools/preflight.mjs");
  const supervisor = await read("tools/dev-restart.mjs");

  assert.match(preflight, /requiredReadyChecks = 5/u);
  assert.match(preflight, /consecutiveReadyChecks >= requiredReadyChecks/u);
  assert.match(preflight, /fully loaded and stable/u);
  assert.match(supervisor, /changeSettleMilliseconds = 1_200/u);
  assert.match(supervisor, /unexpectedExitDelayMilliseconds = 1_500/u);
});
