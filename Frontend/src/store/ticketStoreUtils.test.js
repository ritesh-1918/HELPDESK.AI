import test from 'node:test';
import assert from 'node:assert/strict';

import {
    removeTicketFromQueue,
    updateTicketInQueue,
    upsertTicketInQueue,
} from './ticketStoreUtils.js';

test('upsertTicketInQueue prepends new tickets', () => {
    const tickets = [{ id: 1, subject: 'Existing' }];

    const next = upsertTicketInQueue(tickets, { id: 2, subject: 'New' });

    assert.deepEqual(next.map((ticket) => ticket.id), [2, 1]);
});

test('upsertTicketInQueue merges duplicates instead of adding another row', () => {
    const tickets = [
        { id: 1, subject: 'Existing', status: 'open' },
        { id: 2, subject: 'Other', status: 'open' },
    ];

    const next = upsertTicketInQueue(tickets, { id: 1, status: 'resolved' });

    assert.equal(next.length, 2);
    assert.deepEqual(next[0], { id: 1, subject: 'Existing', status: 'resolved' });
});

test('upsertTicketInQueue deduplicates ticket_id records', () => {
    const tickets = [{ ticket_id: 'T-100', subject: 'Existing' }];

    const next = upsertTicketInQueue(tickets, {
        ticket_id: 'T-100',
        priority: 'high',
    });

    assert.equal(next.length, 1);
    assert.deepEqual(next[0], {
        ticket_id: 'T-100',
        subject: 'Existing',
        priority: 'high',
    });
});

test('updateTicketInQueue updates id and ticket_id matches', () => {
    const tickets = [{ id: 1 }, { ticket_id: 'T-2' }];

    assert.deepEqual(updateTicketInQueue(tickets, 1, { status: 'open' }), [
        { id: 1, status: 'open' },
        { ticket_id: 'T-2' },
    ]);

    assert.deepEqual(updateTicketInQueue(tickets, 'T-2', { status: 'resolved' }), [
        { id: 1 },
        { ticket_id: 'T-2', status: 'resolved' },
    ]);
});

test('removeTicketFromQueue removes id and ticket_id matches', () => {
    const tickets = [{ id: 1 }, { ticket_id: 'T-2' }, { id: 3 }];

    assert.deepEqual(removeTicketFromQueue(tickets, 'T-2'), [{ id: 1 }, { id: 3 }]);
    assert.deepEqual(removeTicketFromQueue(tickets, 1), [{ ticket_id: 'T-2' }, { id: 3 }]);
});
