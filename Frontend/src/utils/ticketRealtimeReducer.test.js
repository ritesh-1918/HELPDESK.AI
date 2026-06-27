import test from 'node:test';
import assert from 'node:assert/strict';

import {
    applyTicketRealtimePayload,
    getTicketRecordId,
} from './ticketRealtimeReducer.js';

test('resolves ticket ids from id and ticket_id fields', () => {
    assert.equal(getTicketRecordId({ id: 42 }), 42);
    assert.equal(getTicketRecordId({ ticket_id: 'T-7' }), 'T-7');
    assert.equal(getTicketRecordId({}), null);
});

test('prepends new realtime inserts', () => {
    const next = applyTicketRealtimePayload(
        [{ id: 1, subject: 'Existing' }],
        { eventType: 'INSERT', new: { id: 2, subject: 'New' } },
    );

    assert.deepEqual(next.map((ticket) => ticket.id), [2, 1]);
});

test('merges realtime updates into existing rows', () => {
    const next = applyTicketRealtimePayload(
        [{ id: 1, status: 'open', priority: 'low' }],
        { eventType: 'UPDATE', new: { id: 1, status: 'resolved' } },
    );

    assert.deepEqual(next, [{ id: 1, status: 'resolved', priority: 'low' }]);
});

test('removes rows when updates no longer match current filters', () => {
    const next = applyTicketRealtimePayload(
        [{ id: 1, status: 'open' }],
        { eventType: 'UPDATE', new: { id: 1, status: 'closed' } },
        { shouldInclude: (ticket) => ticket.status === 'open' },
    );

    assert.deepEqual(next, []);
});

test('removes deleted tickets', () => {
    const next = applyTicketRealtimePayload(
        [{ id: 1 }, { id: 2 }],
        { eventType: 'DELETE', old: { id: 1 } },
    );

    assert.deepEqual(next, [{ id: 2 }]);
});
