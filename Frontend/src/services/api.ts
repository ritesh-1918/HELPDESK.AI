import apiClient from './apiClient';
import { MOCK_TICKETS } from './mockData';
import { API_CONFIG } from '../config';
import { Ticket, AIAnalysisResult } from '../types';

const USE_MOCK = API_CONFIG.USE_MOCK;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getSlaBreachAt = (priority = 'Low') => {
  const hoursMap = { Critical: 2, High: 8, Medium: 24, Low: 72 };
  const slaHours = hoursMap[priority] || 72;
  return new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
};

// In-memory cache replaces localStorage to prevent data leakage (XSS Mitigation)
const inMemoryCache = new Map();

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

// Shared mock logic for createTicket (only used when USE_MOCK is explicitly true)
const createTicketMock = (ticketData) => {
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
    if (USE_MOCK) {
      await delay(500);
      return getStorage<Ticket[]>('tickets', MOCK_TICKETS as Ticket[]);
    }
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
    if (USE_MOCK) {
      await delay(800);
      return createTicketMock(ticketData);
    }
    // In production mode, throw on failure. A silent mock fallback would
    // create a ticket that appears to have been saved but was never persisted
    // to the database — users would lose their support request silently.
    const response = await apiClient.post(`/tickets/save`, ticketData);
    const created = response?.data;

    if (created && created.data) return created;
    return { data: created };
  },

  predictTicket: async (issueText, imageBase64 = '') => {
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

  getSlaEstimate: async (ticketId) => {
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
