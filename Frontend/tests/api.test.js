/**
 * Tests for issue #1393 — api.js must surface backend errors rather than
 * silently falling back to mock data in production mode.
 *
 * Covers:
 * - getTickets throws in production when backend is unreachable
 * - getTickets returns mock data when USE_MOCK=true
 * - createTicket throws in production when backend is unreachable
 * - createTicket returns mock-created ticket when USE_MOCK=true
 * - predictTicket throws in production when backend fails (regression guard)
 * - predictTicket does not fall back to mock on error
 * - getTickets normalises response shapes (array, data.data, data.tickets)
 * - createTicket normalises response shape
 * - predictTicket maps backend response to frontend format correctly
 * - logCorrection swallows errors (fire-and-forget semantics)
 * - getSlaEstimate returns null (not throws) on error
 */

import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// Module setup — mock apiClient so no real HTTP requests are made
// ---------------------------------------------------------------------------

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('../src/services/apiClient.js', () => ({
  default: { get: mockGet, post: mockPost },
}));

// Control USE_MOCK via the mocked config
let _useMock = false;

jest.mock('../src/config.js', () => ({
  API_CONFIG: {
    get USE_MOCK() { return _useMock; },
    BACKEND_URL: 'http://localhost:7860',
  },
}));

jest.mock('../src/services/mockData.js', () => ({
  MOCK_TICKETS: [
    { ticket_id: 'MOCK-001', status: 'Open', subject: 'Mock ticket' }
  ],
}));

// Stub localStorage
const localStorageStore = {};
global.localStorage = {
  getItem: (k) => localStorageStore[k] ?? null,
  setItem: (k, v) => { localStorageStore[k] = v; },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
};

// Stub sessionStorage
global.sessionStorage = {
  getItem: jest.fn(() => '{}'),
  setItem: jest.fn(),
};

// ---------------------------------------------------------------------------
// Import api after mocks are set up
// ---------------------------------------------------------------------------

const { api } = await import('../src/services/api.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBackendError(message = 'Network Error') {
  const err = new Error(message);
  err.response = null;
  return err;
}

function makePredictResponse() {
  return {
    data: {
      category: 'Hardware',
      subcategory: 'Keyboard',
      priority: 'Medium',
      assigned_team: 'IT Support',
      auto_resolve: false,
      confidence: 0.92,
      duplicate_ticket: { similarity: 0.1, duplicate_ticket_id: null },
      summary: 'Keyboard not working',
      entities: [],
      reasoning: 'Hardware issue',
      decision_factors: [],
      image_description: '',
      ocr_text: '',
      is_potential_duplicate: false,
      sla_breach_at: null,
      source_language: 'en',
      source_language_name: 'English',
      was_translated: false,
      original_text: 'Keyboard not working',
    }
  };
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  _useMock = false;
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// getTickets — production mode
// ---------------------------------------------------------------------------

describe('api.getTickets (production mode)', () => {
  test('throws when backend call fails', async () => {
    mockGet.mockRejectedValue(makeBackendError());
    await expect(api.getTickets()).rejects.toThrow();
  });

  test('does NOT fall back to mock data on backend error', async () => {
    mockGet.mockRejectedValue(makeBackendError('Service unavailable'));
    // If it fell back to mock it would return an array and NOT throw
    await expect(api.getTickets()).rejects.toThrow();
  });

  test('returns data array when backend returns array', async () => {
    const tickets = [{ ticket_id: 'T-001' }, { ticket_id: 'T-002' }];
    mockGet.mockResolvedValue({ data: tickets });
    const result = await api.getTickets();
    expect(result).toEqual(tickets);
  });

  test('normalises data.data array shape', async () => {
    const tickets = [{ ticket_id: 'T-001' }];
    mockGet.mockResolvedValue({ data: { data: tickets } });
    const result = await api.getTickets();
    expect(result).toEqual(tickets);
  });

  test('normalises data.tickets array shape', async () => {
    const tickets = [{ ticket_id: 'T-002' }];
    mockGet.mockResolvedValue({ data: { tickets } });
    const result = await api.getTickets();
    expect(result).toEqual(tickets);
  });
});

// ---------------------------------------------------------------------------
// getTickets — mock mode
// ---------------------------------------------------------------------------

describe('api.getTickets (mock mode)', () => {
  test('returns mock data without calling backend', async () => {
    _useMock = true;
    const result = await api.getTickets();
    expect(mockGet).not.toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createTicket — production mode
// ---------------------------------------------------------------------------

describe('api.createTicket (production mode)', () => {
  test('throws when backend call fails', async () => {
    mockPost.mockRejectedValue(makeBackendError());
    await expect(api.createTicket({ subject: 'Test' })).rejects.toThrow();
  });

  test('does NOT create a phantom mock ticket on backend error', async () => {
    mockPost.mockRejectedValue(makeBackendError('500 Internal Server Error'));
    // If it fell back to mock, localStorage would have a 'tickets' key after the call
    try {
      await api.createTicket({ subject: 'Should not be saved' });
    } catch {
      // expected
    }
    const stored = localStorage.getItem('tickets');
    // Should not have written anything to localStorage in production mode
    expect(stored).toBeNull();
  });

  test('returns normalised response when backend succeeds with data.data', async () => {
    const ticket = { ticket_id: 'T-001', status: 'Open' };
    mockPost.mockResolvedValue({ data: { data: ticket } });
    const result = await api.createTicket({ subject: 'Test' });
    expect(result.data).toEqual(ticket);
  });

  test('wraps raw ticket response in data property when needed', async () => {
    const ticket = { ticket_id: 'T-001', status: 'Open' };
    mockPost.mockResolvedValue({ data: ticket });
    const result = await api.createTicket({ subject: 'Test' });
    expect(result.data).toEqual(ticket);
  });
});

// ---------------------------------------------------------------------------
// createTicket — mock mode
// ---------------------------------------------------------------------------

describe('api.createTicket (mock mode)', () => {
  test('creates ticket in localStorage without calling backend', async () => {
    _useMock = true;
    const result = await api.createTicket({ subject: 'Mock ticket', description: 'desc' });
    expect(mockPost).not.toHaveBeenCalled();
    expect(result.data).toBeDefined();
    expect(result.data.ticket_id).toMatch(/^TCKT-/);
  });
});

// ---------------------------------------------------------------------------
// predictTicket
// ---------------------------------------------------------------------------

describe('api.predictTicket (production mode)', () => {
  test('throws when backend call fails', async () => {
    mockPost.mockRejectedValue(makeBackendError('AI backend down'));
    await expect(api.predictTicket('keyboard not working')).rejects.toThrow();
  });

  test('does NOT fall back to mock on AI backend error', async () => {
    mockPost.mockRejectedValue(makeBackendError());
    // A mock fallback would return a data object with a fake ticket — it would
    // NOT throw. Verify it throws.
    await expect(api.predictTicket('test')).rejects.toThrow();
  });

  test('maps backend response to frontend format correctly', async () => {
    mockPost.mockResolvedValue(makePredictResponse());
    const result = await api.predictTicket('Keyboard not working');
    expect(result.data.category).toBe('Hardware');
    expect(result.data.priority).toBe('Medium');
    expect(result.data.assigned_team).toBe('IT Support');
    expect(result.data.ticket_id).toMatch(/^TCKT-/);
    expect(result.data.routing_confidence).toBe(0.92);
    expect(result.data.is_potential_duplicate).toBe(false);
  });

  test('uses sla_breach_at from response when provided', async () => {
    const fixedSla = '2026-06-10T12:00:00.000Z';
    const resp = makePredictResponse();
    resp.data.sla_breach_at = fixedSla;
    mockPost.mockResolvedValue(resp);
    const result = await api.predictTicket('test');
    expect(result.data.sla_breach_at).toBe(fixedSla);
  });

  test('generates sla_breach_at from priority when not in response', async () => {
    mockPost.mockResolvedValue(makePredictResponse());
    const result = await api.predictTicket('test');
    expect(result.data.sla_breach_at).toBeDefined();
    expect(typeof result.data.sla_breach_at).toBe('string');
  });

  test('handles null duplicate_ticket gracefully', async () => {
    const resp = makePredictResponse();
    resp.data.duplicate_ticket = null;
    mockPost.mockResolvedValue(resp);
    const result = await api.predictTicket('test');
    expect(result.data.duplicate_probability).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// logCorrection — fire and forget
// ---------------------------------------------------------------------------

describe('api.logCorrection', () => {
  test('swallows errors without throwing', async () => {
    mockPost.mockRejectedValue(new Error('Log server down'));
    await expect(api.logCorrection({ ticket_id: 'T-1' })).resolves.toBeUndefined();
  });

  test('calls the correct endpoint', async () => {
    mockPost.mockResolvedValue({ data: { status: 'ok' } });
    await api.logCorrection({ ticket_id: 'T-1', corrected_by: 'admin' });
    expect(mockPost).toHaveBeenCalledWith('/ai/log_correction', expect.any(Object));
  });
});

// ---------------------------------------------------------------------------
// getSlaEstimate — returns null on error (not throws)
// ---------------------------------------------------------------------------

describe('api.getSlaEstimate', () => {
  test('returns null when backend call fails', async () => {
    mockGet.mockRejectedValue(makeBackendError());
    const result = await api.getSlaEstimate('TCKT-001');
    expect(result).toBeNull();
  });

  test('returns data on success', async () => {
    const slaData = { breach_at: '2026-06-12T00:00:00Z', status: 'on_track' };
    mockGet.mockResolvedValue({ data: slaData });
    const result = await api.getSlaEstimate('TCKT-001');
    expect(result).toEqual(slaData);
  });
});
