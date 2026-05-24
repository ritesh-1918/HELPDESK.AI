import axios from 'axios';
import { MOCK_TICKETS } from './mockData';
import { API_CONFIG, USE_MOCK } from './config';

const API_BASE_URL = API_CONFIG.BACKEND_URL;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getSlaBreachAt = (priority = 'Low') => {
  const hoursMap = { Critical: 2, High: 8, Medium: 24, Low: 72 };
  const slaHours = hoursMap[priority] || 72;
  return new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
};

// Safe helper to get data from storage or default
const getStorage = (key, defaultData) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      setStorage(key, defaultData);
      return defaultData;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.warn(`[Storage Error] Failed to read or parse '${key}':`, error);
    return defaultData;
  }
};

// Safe helper to set data and handle QuotaExceeded
const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`[Storage Error] Failed to write '${key}'. Possible quota exceeded:`, error);
    // If quota exceeded, we could trim the data, but for now we fail gracefully.
  }
};

export const api = {
  // Login and Signup have been fully migrated to Supabase via authStore.js
  // Ensure that no component tries to use api.login or api.signup anymore.


  getTickets: async () => {
    if (USE_MOCK) {
      await delay(500);
      return getStorage('tickets', MOCK_TICKETS);
    }

    // When not using mock, call real backend with fallback to mock on failure
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets`);
      const data = response?.data;

      // Normalize to the mock shape: an array of tickets
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.tickets)) return data.tickets;

      // Best-effort: if the backend returned an object that's not an array,
      // return that object so callers can inspect fields. This preserves
      // the fallback behavior but attempts to match the mock when possible.
      return data;
    } catch (error) {
      console.warn('Failed to fetch tickets from backend, falling back to mock:', error);
      await delay(500);
      return getStorage('tickets', MOCK_TICKETS);
    }
  },

  createTicket: async (ticketData) => {
    if (USE_MOCK) {
      await delay(800);
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
      tickets.unshift(newTicket); // Add to beginning
      setStorage('tickets', tickets);
      return { data: newTicket };
    }

    // When not using mock, call backend to create ticket and fallback to mock on failure
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets`, ticketData);
      const created = response?.data;

      // Normalize to mock shape: { data: <createdTicket> }
      return { data: created };
    } catch (error) {
      console.warn('Failed to create ticket in backend, falling back to mock:', error);
      await delay(800);
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
      tickets.unshift(newTicket); // Add to beginning
      setStorage('tickets', tickets);
      return { data: newTicket };
    }
  },

  predictTicket: async (issueText, imageBase64 = "") => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
      // ALWAYS call the real backend for prediction if possible
      const response = await axios.post(`${API_BASE_URL}/ai/analyze_ticket`, {
        text: issueText,
        image_base64: imageBase64,
        image_text: "",
        company_id: currentUser.company_id || currentUser.companyId || null
      });

      const result = response.data;

      // Map backend response to frontend format
      return {
        data: {
          ticket_id: "TCKT-" + Math.floor(Math.random() * 10000),
          category: result.category,
          subcategory: result.subcategory,
          priority: result.priority,
          assigned_team: result.assigned_team,
          auto_resolve: result.auto_resolve,
          routing_confidence: result.confidence,
          duplicate_probability: result.duplicate_ticket.similarity,
          duplicate_ticket: result.duplicate_ticket.duplicate_ticket_id,
          summary: result.summary,
          entities: result.entities,
          reasoning: result.reasoning,
          decision_factors: result.decision_factors,
          image_description: result.image_description,
          ocr_text: result.ocr_text,
          is_potential_duplicate: result.is_potential_duplicate || false,
          parent_ticket_id: result.parent_ticket_id || result.duplicate_ticket?.duplicate_ticket_id || null,
          sla_breach_at: result.sla_breach_at || getSlaBreachAt(result.priority)
        }
      };
    } catch (error) {
      console.error("AI Backend Error, falling back to mock:", error);
      // Fallback to mock logic if backend fails
      await delay(1000);
      return {
        data: {
          ticket_id: "TCKT-MOCK-" + Math.floor(Math.random() * 10000),
          category: "Hardware",
          priority: "Medium",
          assigned_team: "Hardware Support",
          auto_resolve: false,
          routing_confidence: 0.5,
          duplicate_probability: 0.0,
          summary: issueText.substring(0, 50) + "...",
          entities: [],
          is_potential_duplicate: false,
          parent_ticket_id: null,
          sla_breach_at: getSlaBreachAt("Medium")
        }
      };
    }
  },

  logCorrection: async (correctionPayload) => {
    try {
      await axios.post(`${API_BASE_URL}/ai/log_correction`, correctionPayload);
    } catch (error) {
      // Non-fatal: log but don't break the UI flow
      console.warn("[Correction Log] Failed to save correction:", error);
    }
  }
};
