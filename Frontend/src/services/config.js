// Centralized frontend config. Reads VITE_USE_MOCK from environment.
// Vite exposes env vars via import.meta.env
const raw = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_USE_MOCK : undefined;

// Default to true when missing. Treat the string "false" (case-insensitive) as false.
export const USE_MOCK = raw === undefined || raw === null
  ? true
  : String(raw).toLowerCase() !== 'false';

// Export other config placeholders if needed by other modules
export const API_CONFIG = {
  BACKEND_URL: typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_BACKEND_URL || '') : ''
};
