import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./useWebSocket.js", import.meta.url), "utf8");

test("useWebSocket declares one heartbeat starter and one connect ref", () => {
  assert.equal(source.match(/const startHeartbeat = useCallback/g)?.length, 1);
  assert.equal(source.match(/const connectRef = useRef/g)?.length, 1);
});

test("startHeartbeat clears existing timers before opening a new interval", () => {
  const heartbeatStart = source.indexOf("const startHeartbeat = useCallback((socket) => {");
  const clearTimersCall = source.indexOf("clearTimers();", heartbeatStart);
  const intervalStart = source.indexOf("pingTimerRef.current = setInterval", heartbeatStart);

  assert.notEqual(heartbeatStart, -1);
  assert.notEqual(clearTimersCall, -1);
  assert.notEqual(intervalStart, -1);
  assert.ok(clearTimersCall < intervalStart);
});
