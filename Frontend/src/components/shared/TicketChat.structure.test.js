import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./TicketChat.jsx", import.meta.url), "utf8");

test("typing indicator timeout stays component-scoped", () => {
  assert.equal(source.includes("window.typingTimeout"), false);
  assert.match(source, /typingIndicatorTimeoutRef\s*=\s*useRef\(null\)/);
  assert.match(source, /typingIndicatorTimeoutRef\.current\s*=\s*window\.setTimeout/);
});

test("typing indicator timeout is cleared during subscription cleanup", () => {
  const cleanupBlocks = [...source.matchAll(/return \(\) => \{([\s\S]*?)supabase\.removeChannel\(channel\);/g)];

  assert.ok(cleanupBlocks.length >= 1);
  assert.ok(
    cleanupBlocks.some((block) => block[1].includes("clearTimeout(typingIndicatorTimeoutRef.current)")),
    "expected a subscription cleanup to clear typingIndicatorTimeoutRef"
  );
});
