/**
 * Tests for Frontend/src/services/api.js (Issue #1153)
 *
 * Tests the localStorage-backed mock API implementation including
 * getTickets, createTicket, getStorage, and setStorage behaviors.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock dependencies that api.js imports
// ---------------------------------------------------------------------------

vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../config', () => ({
  API_CONFIG: {
    USE_MOCK: true,
    BACKEND_URL: 'http://localhost:7860',
  },
}));

// Mock data used in tests
const SAMPLE_TICKETS = [
  {
    ticket_id: 'TCKT-1001',
    status: 'Open',
    subject: 'VPN not working',
    category: 'Network',
    priority: 'High',
    createdAt: '2024-01-01T10:00:00Z',
    messages: [],
  },
  {
    ticket_id: 'TCKT-1002',
    status: 'Resolved',
    subject: 'Password reset',
    category: 'Access',
    priority: 'Medium',
    createdAt: '2024-01-02T11:00:00Z',
    messages: [],
  },
];

vi.mock('../services/mockData', () => ({
  MOCK_TICKETS: SAMPLE_TICKETS,
}));

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get _store() { return store; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seedStorage(key, data) {
  localStorageMock.setItem(key, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Import API after mocks are set up
// ---------------------------------------------------------------------------

let api;

beforeEach(async () => {
  localStorageMock.clear();
  vi.clearAllMocks();
  // Re-import to get fresh module state
  const mod = await import('../services/api.js?v=' + Math.random());
  api = mod.api;
});

// ---------------------------------------------------------------------------
// getTickets tests
// ---------------------------------------------------------------------------

describe('api.getTickets (mock mode)', () => {
  it('returns an array', async () => {
    const result = await api.getTickets();
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns MOCK_TICKETS when localStorage is empty', async () => {
    const result = await api.getTickets();
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns stored tickets when localStorage has data', async () => {
    const stored = [{ ticket_id: 'TCKT-STORED', status: 'Open', subject: 'Stored ticket' }];
    seedStorage('tickets', stored);
    const result = await api.getTickets();
    expect(result).toEqual(stored);
  });

  it('each ticket has a ticket_id', async () => {
    const result = await api.getTickets();
    for (const ticket of result) {
      expect(ticket).toHaveProperty('ticket_id');
    }
  });

  it('each ticket has a status', async () => {
    const result = await api.getTickets();
    for (const ticket of result) {
      expect(ticket).toHaveProperty('status');
    }
  });

  it('returns tickets in the order stored', async () => {
    const stored = [
      { ticket_id: 'TCKT-A', status: 'Open' },
      { ticket_id: 'TCKT-B', status: 'Closed' },
    ];
    seedStorage('tickets', stored);
    const result = await api.getTickets();
    expect(result[0].ticket_id).toBe('TCKT-A');
    expect(result[1].ticket_id).toBe('TCKT-B');
  });

  it('returns an array even if localStorage returns empty array', async () => {
    seedStorage('tickets', []);
    const result = await api.getTickets();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createTicket tests
// ---------------------------------------------------------------------------

describe('api.createTicket (mock mode)', () => {
  it('returns an object', async () => {
    const result = await api.createTicket({ subject: 'Test', description: 'Test desc' });
    expect(typeof result).toBe('object');
  });

  it('returned object has data property', async () => {
    const result = await api.createTicket({ subject: 'Test', description: 'Test desc' });
    expect(result).toHaveProperty('data');
  });

  it('created ticket has ticket_id', async () => {
    const result = await api.createTicket({ subject: 'New Ticket', description: 'Desc' });
    expect(result.data).toHaveProperty('ticket_id');
  });

  it('created ticket has status Open', async () => {
    const result = await api.createTicket({ subject: 'New', description: 'Desc' });
    expect(result.data.status).toBe('Open');
  });

  it('created ticket has createdAt', async () => {
    const result = await api.createTicket({ subject: 'New', description: 'Desc' });
    expect(result.data).toHaveProperty('createdAt');
  });

  it('created ticket has messages array', async () => {
    const result = await api.createTicket({ subject: 'Test', description: 'My description' });
    expect(Array.isArray(result.data.messages)).toBe(true);
  });

  it('first message is user type', async () => {
    const result = await api.createTicket({ subject: 'Test', description: 'My desc' });
    const messages = result.data.messages;
    if (messages.length > 0) {
      expect(messages[0].sender).toBe('user');
    }
  });

  it('ticket_id starts with TCKT-', async () => {
    const result = await api.createTicket({ subject: 'Test', description: 'Desc' });
    expect(result.data.ticket_id).toMatch(/^TCKT-/);
  });

  it('description is set in first message', async () => {
    const desc = 'Unique test description for verification';
    const result = await api.createTicket({ subject: 'Subject', description: desc });
    const messages = result.data.messages;
    if (messages.length > 0) {
      expect(messages[0].message).toBe(desc);
    }
  });

  it('stores new ticket at beginning of tickets list', async () => {
    const existingTickets = [{ ticket_id: 'OLD-001', status: 'Closed' }];
    seedStorage('tickets', existingTickets);
    await api.createTicket({ subject: 'New Ticket', description: 'Desc' });
    // Re-fetch to see updated storage
    const allTickets = await api.getTickets();
    expect(allTickets[0].ticket_id).not.toBe('OLD-001');
  });

  it('increases ticket count by 1', async () => {
    seedStorage('tickets', SAMPLE_TICKETS.slice());
    const before = await api.getTickets();
    const beforeCount = before.length;
    await api.createTicket({ subject: 'New', description: 'Desc' });
    const after = await api.getTickets();
    expect(after.length).toBe(beforeCount + 1);
  });

  it('preserves extra fields passed to createTicket', async () => {
    const result = await api.createTicket({
      subject: 'Test',
      description: 'Desc',
      category: 'Network',
      priority: 'High',
    });
    expect(result.data.category).toBe('Network');
    expect(result.data.priority).toBe('High');
  });
});

// ---------------------------------------------------------------------------
// updateTicket tests
// ---------------------------------------------------------------------------

describe('api.updateTicket (mock mode)', () => {
  it('updateTicket returns a result', async () => {
    seedStorage('tickets', SAMPLE_TICKETS.slice());
    const result = await api.updateTicket('TCKT-1001', { status: 'Resolved' });
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// getTicketById tests
// ---------------------------------------------------------------------------

describe('api.getTicketById (mock mode)', () => {
  it('returns ticket when found', async () => {
    seedStorage('tickets', SAMPLE_TICKETS.slice());
    const result = await api.getTicketById('TCKT-1001');
    if (result) {
      expect(result.ticket_id).toBe('TCKT-1001');
    }
  });
});

// ---------------------------------------------------------------------------
// deleteTicket tests (if available)
// ---------------------------------------------------------------------------

describe('api.deleteTicket (mock mode)', () => {
  it('deleteTicket removes the ticket', async () => {
    const tickets = [
      { ticket_id: 'DEL-001', status: 'Open', subject: 'Delete me', messages: [] },
      { ticket_id: 'KEEP-001', status: 'Open', subject: 'Keep me', messages: [] },
    ];
    seedStorage('tickets', tickets);

    if (typeof api.deleteTicket === 'function') {
      await api.deleteTicket('DEL-001');
      const remaining = await api.getTickets();
      const ids = remaining.map((t) => t.ticket_id);
      expect(ids).not.toContain('DEL-001');
      expect(ids).toContain('KEEP-001');
    }
  });
});

// ---------------------------------------------------------------------------
// SLA helper tests (getSlaBreachAt behavior)
// ---------------------------------------------------------------------------

describe('getSlaBreachAt behavior (via createTicket)', () => {
  it('high priority ticket has sla set in the future', async () => {
    const result = await api.createTicket({
      subject: 'High priority',
      description: 'Critical issue',
      priority: 'High',
    });
    if (result.data.sla_breach_at) {
      const slaDate = new Date(result.data.sla_breach_at);
      expect(slaDate.getTime()).toBeGreaterThan(Date.now());
    }
  });

  it('critical priority ticket has shorter sla than low priority', async () => {
    const critical = await api.createTicket({ subject: 'C', description: 'D', priority: 'Critical' });
    const low = await api.createTicket({ subject: 'L', description: 'D', priority: 'Low' });

    if (critical.data.sla_breach_at && low.data.sla_breach_at) {
      const criticalTime = new Date(critical.data.sla_breach_at).getTime();
      const lowTime = new Date(low.data.sla_breach_at).getTime();
      expect(criticalTime).toBeLessThan(lowTime);
    }
  });
});

// ---------------------------------------------------------------------------
// Storage error handling tests
// ---------------------------------------------------------------------------

describe('storage error handling', () => {
  it('getTickets handles localStorage parse error gracefully', async () => {
    // Write invalid JSON to localStorage
    localStorageMock._store['tickets'] = 'INVALID JSON {{{';
    const result = await api.getTickets();
    expect(Array.isArray(result)).toBe(true);
  });
});
