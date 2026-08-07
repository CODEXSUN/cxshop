import assert from "node:assert/strict";
import test from "node:test";
import { formatChangelogCommitSubject } from "./changelog.mjs";
import { bumpPatch } from "./version-bump.mjs";

test("bumpPatch increments the patch version", () => {
  assert.equal(bumpPatch("1.0.1"), "1.0.2");
});

test("commit subjects use the changelog reference and title", () => {
  assert.equal(
    formatChangelogCommitSubject({ reference: 2, title: "Marketplace foundation", version: "1.0.2" }),
    "#2 - Marketplace foundation"
  );
});
