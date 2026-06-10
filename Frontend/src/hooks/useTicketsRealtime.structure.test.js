import { readFileSync } from 'node:fs';
import assert from 'node:assert';
import test from 'node:test';

const source = readFileSync('Frontend/src/hooks/useTicketsRealtime.js', 'utf8');

test('validates realtime payload event and record shape before store updates', () => {
  assert.match(source, /const REALTIME_EVENTS = new Set\(\['INSERT', 'UPDATE', 'DELETE'\]\)/);
  assert.match(source, /REALTIME_EVENTS\.has\(payload\.eventType\)/);
  assert.match(source, /return isRecord\(payload\.old\)/);
  assert.match(source, /return isRecord\(payload\.new\)/);
});

test('malformed realtime payloads are ignored before reducer updates run', () => {
  const guardIndex = source.indexOf('if (!isValidTicketRealtimePayload(payload))');
  const updateIndex = source.indexOf('applyTicketRealtimePayload(currentTickets, payload');

  assert.notStrictEqual(guardIndex, -1);
  assert.notStrictEqual(updateIndex, -1);
  assert.ok(guardIndex < updateIndex);
});

test('unexpected realtime processing errors are caught and logged', () => {
  assert.match(source, /try \{/);
  assert.match(source, /catch \(error\) \{/);
  assert.match(source, /warnMalformedRealtimePayload\(payload, error\)/);
});
