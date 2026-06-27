import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// 1. Mock global window object BEFORE importing the API module to avoid ReferenceError in config.js
global.window = {
  location: {
    hostname: 'localhost',
    origin: 'http://localhost:3000',
  },
};

// 2. Setup localStorage mock before import
let localStore = {};
const mockLocalStorage = {
  getItem: vi.fn((key) => {
    return localStore[key] === undefined ? null : localStore[key];
  }),
  setItem: vi.fn((key, value) => {
    localStore[key] = value.toString();
  }),
  clear: vi.fn(() => {
    localStore = {};
  }),
  removeItem: vi.fn((key) => {
    delete localStore[key];
  }),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock console.warn to check for storage error logs
const originalConsoleWarn = console.warn;
console.warn = vi.fn();

// 3. Dynamically import target module to prevent hoisting issues
const { api, setUseMock } = await import('./api');
const { MOCK_TICKETS } = await import('./mockData');

describe('Frontend API Service - getTickets and createTicket (Mock Mode)', () => {
  beforeEach(() => {
    localStore = {};
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockLocalStorage.removeItem.mockClear();
    console.warn.mockClear();
    
    // Always reset USE_MOCK to true for default mock mode tests
    setUseMock(true);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTickets', () => {
    it('should fetch tickets after a delay of 500ms in USE_MOCK mode', async () => {
      const ticketsPromise = api.getTickets();

      // Verify it is not resolved immediately
      let resolved = false;
      ticketsPromise.then(() => {
        resolved = true;
      });

      await vi.advanceTimersByTimeAsync(400);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(100);
      const tickets = await ticketsPromise;
      
      expect(tickets).toBeDefined();
      expect(tickets.length).toBe(MOCK_TICKETS.length);
    });

    it('should initialize localStorage with MOCK_TICKETS if no tickets exist in storage', async () => {
      const ticketsPromise = api.getTickets();
      await vi.runAllTimersAsync();
      const tickets = await ticketsPromise;

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tickets');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tickets', JSON.stringify(MOCK_TICKETS));
      expect(tickets).toEqual(MOCK_TICKETS);
    });

    it('should load tickets from localStorage if they already exist in storage', async () => {
      const customTickets = [
        { id: 999, title: 'Custom Ticket', status: 'Open', messages: [] }
      ];
      localStore['tickets'] = JSON.stringify(customTickets);

      const ticketsPromise = api.getTickets();
      await vi.runAllTimersAsync();
      const tickets = await ticketsPromise;

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tickets');
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(tickets).toEqual(customTickets);
    });

    it('should handle localStorage parse errors gracefully and return default MOCK_TICKETS', async () => {
      localStore['tickets'] = 'invalid-json-{';

      const ticketsPromise = api.getTickets();
      await vi.runAllTimersAsync();
      const tickets = await ticketsPromise;

      expect(console.warn).toHaveBeenCalled();
      expect(tickets).toEqual(MOCK_TICKETS);
    });
  });

  describe('createTicket', () => {
    it('should create and insert a new ticket after a delay of 800ms', async () => {
      const ticketData = {
        title: 'New API Issue',
        description: 'Testing the api.js service implementation.',
        priority: 'High',
        category: 'Software'
      };

      const creationPromise = api.createTicket(ticketData);

      let resolved = false;
      creationPromise.then(() => {
        resolved = true;
      });

      await vi.advanceTimersByTimeAsync(700);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(100);
      const response = await creationPromise;

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.title).toBe('New API Issue');
      expect(response.data.priority).toBe('High');
      expect(response.data.status).toBe('Open');
      expect(response.data.ticket_id).toMatch(/^TCKT-\d+$/);
    });

    it('should prepend the newly created ticket to the tickets list in localStorage', async () => {
      const ticketData = {
        title: 'Network Lag',
        summary: 'Cannot connect to Slack.',
        priority: 'Low',
        category: 'Network'
      };

      const initialLength = MOCK_TICKETS.length;
      const responsePromise = api.createTicket(ticketData);
      await vi.runAllTimersAsync();
      const response = await responsePromise;

      const storedTickets = JSON.parse(localStore['tickets']);
      expect(storedTickets[0].title).toBe('Network Lag');
      expect(storedTickets[0].ticket_id).toBe(response.data.ticket_id);
      expect(storedTickets.length).toBe(initialLength + 1);
    });

    it('should populate messages array correctly using ticket description or summary', async () => {
      // Case 1: with description
      const t1Promise = api.createTicket({ description: 'My Description' });
      await vi.runAllTimersAsync();
      const t1 = await t1Promise;
      expect(t1.data.messages[0]).toEqual(
        expect.objectContaining({
          sender: 'user',
          message: 'My Description',
          timestamp: expect.any(String)
        })
      );

      // Case 2: with summary (when description is missing)
      const t2Promise = api.createTicket({ summary: 'My Summary' });
      await vi.runAllTimersAsync();
      const t2 = await t2Promise;
      expect(t2.data.messages[0]).toEqual(
        expect.objectContaining({
          sender: 'user',
          message: 'My Summary',
          timestamp: expect.any(String)
        })
      );

      // Case 3: both missing
      const t3Promise = api.createTicket({});
      await vi.runAllTimersAsync();
      const t3 = await t3Promise;
      expect(t3.data.messages[0].message).toBe('');
    });

    it('should handle localStorage write errors (QuotaExceeded) gracefully without throwing', async () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const ticketData = { title: 'Quota test', description: 'test' };
      const responsePromise = api.createTicket(ticketData);
      await vi.runAllTimersAsync();
      const response = await responsePromise;

      expect(console.warn).toHaveBeenCalled();
      expect(response.data).toBeDefined();
      expect(response.data.title).toBe('Quota test');
    });
  });

  describe('USE_MOCK toggling', () => {
    it('should return undefined for getTickets and createTicket when USE_MOCK is false', async () => {
      setUseMock(false);

      const getResult = await api.getTickets();
      const createResult = await api.createTicket({ title: 'No Mock' });

      expect(getResult).toBeUndefined();
      expect(createResult).toBeUndefined();
    });
  });
});
