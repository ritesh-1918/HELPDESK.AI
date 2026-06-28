import apiClient from './apiClient';
import { MOCK_TICKETS } from './mockData';
import { API_CONFIG } from '../config';
import { Ticket, AIAnalysisResult } from '../types';

const USE_MOCK = API_CONFIG.USE_MOCK;
const OFFLINE_TICKET_QUEUE_KEY = 'helpdesk-offline-ticket-queue';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getSlaBreachAt = (priority = 'Low') => {
  const hoursMap: Record<string, number> = { Critical: 2, High: 8, Medium: 24, Low: 72 };
  const slaHours = hoursMap[priority] || 72;
  return new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
};

// In-memory cache replaces localStorage to prevent data leakage (XSS Mitigation)
const inMemoryCache = new Map();

type OfflineTicketQueueItem = {
  id: string;
  queuedAt: string;
  reason: 'offline' | 'network-error';
  ticketData: Partial<Ticket>;
};

let useMockOverride: boolean | null = null;
let offlineSyncListenerRegistered = false;

export const setUseMock = (value: boolean) => {
  useMockOverride = value;
};

const isMockMode = () => useMockOverride ?? USE_MOCK;

const hasBrowserStorage = () =>
  typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';

// Safe helper to get data from storage or default
const getStorage = <T>(key: string, defaultData: T): T => {
  try {
    const stored = inMemoryCache.get(key);
    if (!stored) {
      setStorage(key, defaultData);
      return defaultData;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.warn(`[Storage Error] Failed to read or parse '${key}':`, error);
    return defaultData;
  }
};

// Safe helper to set data and handle QuotaExceeded
const setStorage = <T>(key: string, data: T): void => {
  try {
    inMemoryCache.set(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`[Storage Error] Failed to write '${key}':`, error);
  }
};

const getOfflineTicketQueue = (): OfflineTicketQueueItem[] => {
  if (!hasBrowserStorage()) return [];

  try {
    const raw = globalThis.localStorage.getItem(OFFLINE_TICKET_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[Offline Queue] Failed to read queued tickets:', error);
    return [];
  }
};

const setOfflineTicketQueue = (queue: OfflineTicketQueueItem[]): void => {
  if (!hasBrowserStorage()) return;

  try {
    globalThis.localStorage.setItem(OFFLINE_TICKET_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('[Offline Queue] Failed to persist queued tickets:', error);
  }
};

const isNetworkFailure = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { response?: unknown; code?: string; message?: string };
  if (!maybeError.response) return true;
  if (maybeError.code === 'ERR_NETWORK') return true;
  return typeof maybeError.message === 'string' && /network|offline/i.test(maybeError.message);
};

const queueOfflineTicket = (ticketData: Partial<Ticket>, reason: OfflineTicketQueueItem['reason']) => {
  const queuedAt = new Date().toISOString();
  const queueItem: OfflineTicketQueueItem = {
    id: `offline-ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    queuedAt,
    reason,
    ticketData,
  };

  const queue = getOfflineTicketQueue();
  queue.push(queueItem);
  setOfflineTicketQueue(queue);

  const queuedTicket: Ticket & {
    local_id: string;
    sync_status: 'queued';
    queued_at: string;
  } = {
    ticket_id: queueItem.id,
    status: 'Pending Sync',
    createdAt: queuedAt,
    priority: ((ticketData.priority as Ticket['priority'] | undefined) ?? 'Low') as Ticket['priority'],
    category: ticketData.category || 'Unclassified',
    summary: ticketData.summary || ticketData.description || '',
    description: ticketData.description,
    assigned_team: ticketData.assigned_team,
    company: ticketData.company,
    messages: [
      {
        sender: 'user',
        message: ticketData.description || ticketData.summary || '',
        timestamp: queuedAt,
      },
    ],
    local_id: queueItem.id,
    sync_status: 'queued',
    queued_at: queuedAt,
  };

  return queuedTicket;
};

export const syncQueuedTicketPayloads = async (): Promise<Ticket[]> => {
  if (isMockMode() || !hasBrowserStorage() || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    return [];
  }

  const queue = getOfflineTicketQueue();
  if (!queue.length) return [];

  const remainingQueue: OfflineTicketQueueItem[] = [];
  const syncedTickets: Ticket[] = [];

  for (const item of queue) {
    try {
      const response = await apiClient.post('/tickets/save', item.ticketData);
      const created = response?.data?.data ?? response?.data;
      if (created) {
        syncedTickets.push(created);
      }
    } catch (error) {
      if (isNetworkFailure(error)) {
        remainingQueue.push(item);
        continue;
      }

      console.warn('[Offline Queue] Failed to sync queued ticket payload:', error);
      remainingQueue.push(item);
    }
  }

  setOfflineTicketQueue(remainingQueue);
  return syncedTickets;
};

const ensureOfflineSyncListener = () => {
  if (!hasBrowserStorage() || offlineSyncListenerRegistered) return;

  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

  window.addEventListener('online', () => {
    void syncQueuedTicketPayloads();
  });
  offlineSyncListenerRegistered = true;
};

ensureOfflineSyncListener();

// Shared mock logic for createTicket (only used when USE_MOCK is explicitly true)
const createTicketMock = (ticketData: Partial<Ticket>) => {
  const tickets = getStorage('tickets', MOCK_TICKETS);
  const newTicket = {
    ticket_id: "TCKT-" + Math.floor(Math.random() * 10000),
    status: 'Open',
    createdAt: new Date().toISOString(),
    ...ticketData,
    messages: [
      {
        sender: 'user',
        message: ticketData.description || ticketData.summary || '',
        timestamp: new Date().toISOString()
      }
    ]
  };
  tickets.unshift(newTicket);
  setStorage('tickets', tickets);
  return { data: newTicket };
};

export const api = {
  // Login and Signup have been fully migrated to Supabase via authStore.js
  // Ensure that no component tries to use api.login or api.signup anymore.

  getTickets: async () => {
    if (isMockMode()) {
      await delay(500);
      return getStorage<Ticket[]>('tickets', MOCK_TICKETS as Ticket[]);
    }
    await syncQueuedTicketPayloads();
    // In production mode, surface backend errors so the UI can show a proper
    // error state rather than silently returning stale mock data that could
    // mislead users into believing they're seeing real tickets.
    const response = await apiClient.get(`/tickets`);
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.tickets)) return data.tickets;

    return data;
  },

  createTicket: async (ticketData: Partial<Ticket>): Promise<{ data: Ticket } | undefined> => {
    if (isMockMode()) {
      await delay(800);
      return createTicketMock(ticketData);
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await delay(250);
      return { data: queueOfflineTicket(ticketData, 'offline') };
    }

    await syncQueuedTicketPayloads();

    // In production mode, throw on failure. If the request fails because the
    // network dropped, keep the payload queued so the user does not lose it.
    try {
      const response = await apiClient.post(`/tickets/save`, ticketData);
      if (!response) return undefined;

      const created = response?.data;

      if (created && created.data) return created;
      if (created === undefined) return undefined;
      return { data: created };
    } catch (error) {
      if (isNetworkFailure(error)) {
        console.warn('[Offline Queue] Network failed while creating ticket; caching payload for later sync.');
        return { data: queueOfflineTicket(ticketData, 'network-error') };
      }
      throw error;
    }
  },

  predictTicket: async (issueText: string, imageBase64 = '') => {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    const response = await apiClient.post('/ai/analyze_ticket', {
      text: issueText,
      image_base64: imageBase64,
      image_text: "",
      company_id: currentUser.company_id || currentUser.companyId || null
    });

    const result = response.data;

    return {
      data: {
        ticket_id: 'TCKT-' + Math.floor(Math.random() * 10000),
        category: result.category,
        subcategory: result.subcategory,
        priority: result.priority,
        assigned_team: result.assigned_team,
        auto_resolve: result.auto_resolve,
        routing_confidence: result.confidence,
        duplicate_probability: result.duplicate_ticket?.similarity,
        duplicate_ticket: result.duplicate_ticket?.duplicate_ticket_id,
        summary: result.summary,
        entities: result.entities,
        reasoning: result.reasoning,
        decision_factors: result.decision_factors,
        image_description: result.image_description,
        ocr_text: result.ocr_text,
        is_potential_duplicate: result.is_potential_duplicate || false,
        parent_ticket_id: result.parent_ticket_id || result.duplicate_ticket?.duplicate_ticket_id || null,
        sla_breach_at: result.sla_breach_at || getSlaBreachAt(result.priority),
        source_language: result.source_language,
        source_language_name: result.source_language_name,
        was_translated: result.was_translated,
        original_text: result.original_text
      }
    };
  },

  getSlaEstimate: async (ticketId: string) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/sla-estimate`);
      return response.data;
    } catch (error) {
      console.error(`[SLA Estimate Error] Failed to fetch for ${ticketId}:`, error);
      return null;
    }
  },

  logCorrection: async (correctionPayload: any): Promise<void> => {
    try {
      await apiClient.post(`/ai/log_correction`, correctionPayload);
    } catch (error) {
      console.warn("[Correction Log] Failed to save correction:", error);
    }
  },
};
