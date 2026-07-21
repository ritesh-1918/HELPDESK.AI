/**
 * Unit tests for api.js — getTickets and createTicket mock methods.
 * Tests USE_MOCK mode, localStorage handling, and ticket creation with messages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing api.js
vi.mock('./apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock('./mockData', () => ({
    MOCK_TICKETS: [
        { ticket_id: 'TCKT-001', summary: 'Test ticket 1', status: 'Open' },
        { ticket_id: 'TCKT-002', summary: 'Test ticket 2', status: 'Closed' },
    ],
}));

vi.mock('../config', () => ({
    API_CONFIG: {
        USE_MOCK: true,
        BACKEND_URL: 'http://localhost:8000',
    },
}));

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock });

// Import api after mocks are set up
import { api } from '../api.js';

describe('api.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── getTickets (Mock Mode) ──────────────────────────────────

    describe('getTickets (USE_MOCK=true)', () => {
        it('should return tickets from localStorage when available', async () => {
            const storedTickets = [
                { ticket_id: 'TCKT-100', summary: 'Stored ticket', status: 'Open' },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTickets));

            const resultPromise = api.getTickets();
            await vi.advanceTimersByTimeAsync(600);
            const result = await resultPromise;

            expect(result).toEqual(storedTickets);
            expect(localStorageMock.getItem).toHaveBeenCalledWith('tickets');
        });

        it('should return MOCK_TICKETS when localStorage is empty', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            const resultPromise = api.getTickets();
            await vi.advanceTimersByTimeAsync(600);
            const result = await resultPromise;

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0].ticket_id).toBe('TCKT-001');
        });

        it('should initialize localStorage with MOCK_TICKETS when empty', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            const resultPromise = api.getTickets();
            await vi.advanceTimersByTimeAsync(600);
            await resultPromise;

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'tickets',
                expect.any(String)
            );
        });

        it('should handle corrupted localStorage data gracefully', async () => {
            localStorageMock.getItem.mockReturnValue('invalid-json{{{');

            const resultPromise = api.getTickets();
            await vi.advanceTimersByTimeAsync(600);
            const result = await resultPromise;

            // Should fall back to MOCK_TICKETS
            expect(Array.isArray(result)).toBe(true);
        });

        it('should apply delay in mock mode', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

            const resultPromise = api.getTickets();

            // Before delay completes
            let resolved = false;
            resultPromise.then(() => { resolved = true; });

            await vi.advanceTimersByTimeAsync(400);
            expect(resolved).toBe(false);

            await vi.advanceTimersByTimeAsync(200);
            expect(resolved).toBe(true);
        });
    });

    // ── createTicket (Mock Mode) ────────────────────────────────

    describe('createTicket (USE_MOCK=true)', () => {
        it('should create a ticket with generated fields', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

            const ticketData = {
                summary: 'New ticket',
                description: 'Test description',
                category: 'Bug',
                priority: 'High',
            };

            const resultPromise = api.createTicket(ticketData);
            await vi.advanceTimersByTimeAsync(900);
            const result = await resultPromise;

            expect(result.data).toBeDefined();
            expect(result.data.ticket_id).toMatch(/^TCKT-\d+$/);
            expect(result.data.status).toBe('Open');
            expect(result.data.createdAt).toBeDefined();
            expect(result.data.summary).toBe('New ticket');
        });

        it('should add user message from description', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

            const ticketData = {
                summary: 'Test',
                description: 'My laptop is broken',
            };

            const resultPromise = api.createTicket(ticketData);
            await vi.advanceTimersByTimeAsync(900);
            const result = await resultPromise;

            expect(result.data.messages).toBeDefined();
            expect(result.data.messages.length).toBe(1);
            expect(result.data.messages[0].sender).toBe('user');
            expect(result.data.messages[0].message).toBe('My laptop is broken');
        });

        it('should add ticket to beginning of stored tickets', async () => {
            const existingTickets = [
                { ticket_id: 'TCKT-001', summary: 'Existing' },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(existingTickets));

            const resultPromise = api.createTicket({ summary: 'New', description: 'd' });
            await vi.advanceTimersByTimeAsync(900);
            await resultPromise;

            // Check that setItem was called with the new ticket first
            const setItemCalls = localStorageMock.setItem.mock.calls;
            const ticketsCall = setItemCalls.find(call => call[0] === 'tickets');
            expect(ticketsCall).toBeDefined();

            const savedTickets = JSON.parse(ticketsCall[1]);
            expect(savedTickets[0].summary).toBe('New');
            expect(savedTickets[1].summary).toBe('Existing');
        });

        it('should use summary as message when description is empty', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

            const ticketData = {
                summary: 'Quick summary',
                description: '',
            };

            const resultPromise = api.createTicket(ticketData);
            await vi.advanceTimersByTimeAsync(900);
            const result = await resultPromise;

            expect(result.data.messages[0].message).toBe('Quick summary');
        });

        it('should apply 800ms delay in mock mode', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

            const resultPromise = api.createTicket({ summary: 't', description: 'd' });

            let resolved = false;
            resultPromise.then(() => { resolved = true; });

            await vi.advanceTimersByTimeAsync(700);
            expect(resolved).toBe(false);

            await vi.advanceTimersByTimeAsync(200);
            expect(resolved).toBe(true);
        });
    });

    // ── Storage Helpers ─────────────────────────────────────────

    describe('Storage handling', () => {
        it('should handle localStorage quota exceeded gracefully', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const resultPromise = api.getTickets();
            await vi.advanceTimersByTimeAsync(600);
            const result = await resultPromise;

            // Should still return data even if storage fails
            expect(Array.isArray(result)).toBe(true);
        });
    });
});
