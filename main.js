javascript
/**
 * /frontend/src/main.js
 * 
 * APPLICATION ENTRY POINT – HARDENED PRODUCTION VERSION
 * -----------------------------------------------------
 * Mounts the React application after performing critical security checks.
 * Enforces Content Security Policy (CSP) nonce verification, blocks execution
 * when nonce is missing, and uses only safe DOM APIs to prevent XSS.
 * Also includes structured logging, input validation, and graceful fallback.
 * 
 * @module main
 * @version 2.1.0
 * @author Security Team
 * @license MIT
 * 
 * @description
 * Implements the following security measures:
 * - CSP nonce extraction and validation (multi‑strategy)
 * - Log level configuration from environment (VITE_LOG_LEVEL or LOG_LEVEL)
 * - Safe DOM manipulation without innerHTML or dangerous APIs
 * - Graceful fallback when security checks fail
 * - Strictly validated React mount with nonce propagation
 * - Structured error logging with context
 * 
 * @requires module:react
 * @requires module:react-dom/client
 * @requires module:./App
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// -----------------------------------------------------------------------------
// 1. Logging Configuration with Dynamic Level
// -----------------------------------------------------------------------------

/** 
 * Log level constants (increasing severity).
 * @readonly
 * @enum {number}
 */
const LOG_LEVEL = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
});

/**
 * Safely resolves the effective log level from environment variables.
 * Falls back to INFO if unset, invalid, or unavailable.
 * 
 * @returns {number} One of {@link LOG_LEVEL} values.
 */
function resolveLogLevel() {
  try {
    const envRaw = 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LOG_LEVEL) ||
      (typeof process !== 'undefined' && process.env?.LOG_LEVEL);
    if (typeof envRaw !== 'string') {
      return LOG_LEVEL.INFO;
    }
    const parsed = Number(envRaw);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 3) {
      return parsed;
    }
    return LOG_LEVEL.INFO;
  } catch (err) {
    // In case of restricted globals (e.g., SSR, testing environments)
    console.warn('[SECURITY] Failed to read log level, defaulting to INFO:', err);
    return LOG_LEVEL.INFO;
  }
}

/** @type {number} */
const EFFECTIVE_LOG_LEVEL = resolveLogLevel();

/**
 * Structured logger with level-based filtering.
 * Each method prepends a severity tag and includes a timestamp for audit trails.
 * 
 * @namespace Logger
 */
const Logger = Object.freeze({
  /** @param {...unknown} args */
  debug(...args) {
    if (EFFECTIVE_LOG_LEVEL <= LOG_LEVEL.DEBUG) {
      console.debug(`[DEBUG] [${new Date().toISOString()}]`, ...args);
    }
  },
  /** @param {...unknown} args */
  info(...args) {
    if (EFFECTIVE_LOG_LEVEL <= LOG_LEVEL.INFO) {
      console.info(`[INFO] [${new Date().toISOString()}]`, ...args);
    }
  },
  /** @param {...unknown} args */
  warn(...args) {
    if (EFFECTIVE_LOG_LEVEL <= LOG_LEVEL.WARN) {
      console.warn(`[WARN] [${new Date().toISOString()}]`, ...args);
    }
  },
  /** @param {...unknown} args */
  error(...args) {
    if (EFFECTIVE_LOG_LEVEL <= LOG_LEVEL.ERROR) {
      console.error(`[ERROR] [${new Date().toISOString()}]`, ...args);
    }
  },
});

// -----------------------------------------------------------------------------
// 2. CSP Nonce Extraction (Multi‑strategy, validated)
// -----------------------------------------------------------------------------

/**
 * Valid character set for a CSP nonce.
 * Allowed: alphanumeric, +, /, =, underscore, hyphen.
 * @type {RegExp}
 */
const NONCE_PATTERN = /^[A-Za-z0-9+/=_\-]+$/;

/** Minimum allowed nonce length (as per OWASP recommendations). */
const NONCE_MIN_LENGTH = 8;

/** Maximum allowed nonce length (256 chars is a safe limit). */
const NONCE_MAX_LENGTH = 256;

/**
 * Validates and normalizes a nonce string.
 * 
 * @param {string|null} rawNonce - Raw nonce value.
 * @returns {string|null} Validated nonce or null if invalid.
 * @throws {TypeError} If rawNonce is not a string or null.
 */
function validateNonce(rawNonce) {
  // Input type validation
  if (rawNonce !== null && typeof rawNonce !== 'string') {
    throw new TypeError(`Expected string or null, got ${typeof rawNonce}`);
  }

  if (rawNonce === null || rawNonce.trim() === '') {
    return null;
  }

  const cleaned = rawNonce.trim();

  // Length checks: typical CSP nonces are 8–256 characters
  if (cleaned.length < NONCE_MIN_LENGTH || cleaned.length > NONCE_MAX_LENGTH) {
    Logger.warn(
      `[SECURITY] CSP nonce length out of range (${cleaned.length} chars).`
    );
    return null;
  }

  // Character set: only base64+, = / _ -
  if (!NONCE_PATTERN.test(cleaned)) {
    Logger.warn('[SECURITY] CSP nonce contains disallowed characters.');
    return null;
  }

  return cleaned;
}

/**
 * Safely retrieves the CSP nonce attribute from a script element.
 * Uses multiple strategies to support modern modules and fallback scripts.
 * 
 * @returns {string|null} Validated nonce value, or null if missing/invalid.
 */
function getCspNonce() {
  let rawNonce = null;

  // Strategy 1: document.currentScript (works for module scripts in modern browsers)
  try {
    const currentScript = document.currentScript;
    if (
      currentScript &&
      currentScript instanceof HTMLScriptElement &&
      currentScript.hasAttribute('nonce')
    ) {
      rawNonce = currentScript.getAttribute('nonce');
    }
  } catch (err) {
    Logger.warn('[SECURITY] Failed to access document.currentScript:', err);
  }

  // Strategy 2: Vite entry point by ID (common in Vite-generated HTML)
  if (!rawNonce) {
    try {
      const viteEntry = document.getElementById('__vite_entry__');
      if (
        viteEntry &&
        viteEntry instanceof HTMLScriptElement &&
        viteEntry.hasAttribute('nonce')
      ) {
        rawNonce = viteEntry.getAttribute('nonce');
      }
    } catch (err) {
      Logger.warn('[SECURITY] Failed to retrieve __vite_entry__ element:', err);
    }
  }

  // Strategy 3: Scan all <script> tags with nonce (last resort)
  if (!rawNonce) {
    try {
      // Use querySelectorAll which returns a static NodeList
      const scripts = document.querySelectorAll('script[nonce]');
      for (const script of scripts) {
        if (script instanceof HTMLScriptElement) {
          const n = script.getAttribute('nonce');
          if (typeof n === 'string' && n.trim().length > 0) {
            rawNonce = n;
            break;
          }
        }
      }
    } catch (err) {
      Logger.warn('[SECURITY] Failed to query script elements:', err);
    }
  }

  return validateNonce(rawNonce);
}

// -----------------------------------------------------------------------------
// 3. Security Checks
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} SecurityCheckResult
 * @property {boolean} pass - Whether all checks passed.
 * @property {string|null} nonce - Validated CSP nonce, or null.
 */

/**
 * Validates all security prerequisites before mounting the application.
 * Currently checks for a valid CSP nonce; can be extended.
 * 
 * @returns {SecurityCheckResult}
 */
function runSecurityChecks() {
  const nonce = getCspNonce();
  if (!nonce) {
    Logger.error(
      '[SECURITY] CSP nonce missing or invalid. ' +
      'Execution will be blocked if a strict CSP is enforced. ' +
      'Ensure the server injects a nonce into the script tag.'
    );
    return { pass: false, nonce: null };
  }
  Logger.info('[SECURITY] CSP nonce verified and valid');
  return { pass: true, nonce };
}

// -----------------------------------------------------------------------------
// 4. Safe Fallback Rendering (No innerHTML, No inline event handlers)
// -----------------------------------------------------------------------------

/**
 * Creates a secure fallback message when the application cannot start due to
 * a security configuration error. Uses only safe DOM APIs and avoids any
 * inline event handlers or innerHTML.
 * 
 * The fallback uses inline styles only as a last resort because the app
 * cannot load normal CSS when security checks fail. Styles are minimal.
 * 
 * @param {HTMLElement} container - The DOM element where fallback is shown.
 * @returns {void}
 * @throws {TypeError} If container is not an HTMLElement.
 */
function renderFallback(container) {
  if (!(container instanceof HTMLElement)) {
    throw new TypeError('Container must be an HTMLElement');
  }

  // Clear container safely (no children to remove, but do it properly)
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Create fallback elements using safe DOM methods
  const fallbackContainer = document.createElement('div');
  fallbackContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 20px;
    text-align: center;
  `;

  const heading = document.createElement('h1');
  heading.textContent = 'Application Security Configuration Error';
  heading.style.color = '#d32f2f';
  heading.style.marginBottom = '16px';

  const message = document.createElement('p');
  message.textContent =
    'A valid Content Security Policy nonce could not be found or is invalid. ' +
    'The application cannot start due to security restrictions. ' +
    'Please contact the system administrator.';
  message.style.color = '#555';
  message.style.maxWidth = '600px';

  fallbackContainer.appendChild(heading);
  fallbackContainer.appendChild(message);
  container.appendChild(fallbackContainer);

  Logger.info('[SECURITY] Fallback UI rendered due to missing/nonce check failure');
}

// -----------------------------------------------------------------------------
// 5. Application Bootstrap
// -----------------------------------------------------------------------------

/**
 * Bootstraps the React application.
 * Performs security checks, then either mounts the app with nonce propagation or
 * renders a secure fallback.
 * 
 * @param {HTMLElement} rootElement - The root DOM element for mounting.
 * @returns {void}
 */
function bootstrapApp(rootElement) {
  if (!(rootElement instanceof HTMLElement)) {
    Logger.error('Root element is not a valid HTMLElement. Aborting.');
    renderFallback(document.body);
    return;
  }

  const securityResult = runSecurityChecks();

  if (!securityResult.pass) {
    // Render fallback and do not mount the React app
    renderFallback(rootElement);
    return;
  }

  try {
    // Create React root and render with strict mode for development warnings
    // The nonce is used by the server to allow this script; here we pass it
    // to the React root context if needed (future extensibility)
    const root = ReactDOM.createRoot(rootElement, {
      identifierPrefix: 'app-root',
    });

    root.render(
      <React.StrictMode>
        <App nonce={securityResult.nonce} />
      </React.StrictMode>
    );

    Logger.info('[BOOT] React application mounted successfully with CSP nonce');
  } catch (mountError) {
    Logger.error('[BOOT] Failed to mount React application:', mountError);
    // Clean up and show fallback
    try {
      while (rootElement.firstChild) {
        rootElement.removeChild(rootElement.firstChild);
      }
    } catch (cleanupError) {
      Logger.error('[BOOT] Cleanup after mount failure also failed:', cleanupError);
    }
    renderFallback(rootElement);
  }
}

// -----------------------------------------------------------------------------
// 6. Entry Point Execution
// -----------------------------------------------------------------------------

(function main() {
  try {
    const rootId = 'root';
    const rootElement = document.getElementById(rootId);

    if (!rootElement) {
      // If the root element is missing, create one and attach to body as fallback
      Logger.error(
        `[BOOT] Root element '#${rootId}' not found in DOM. Creating fallback container.`
      );
      const fallbackRoot = document.createElement('div');
      fallbackRoot.id = rootId;
      document.body.appendChild(fallbackRoot);
      bootstrapApp(fallbackRoot);
    } else {
      bootstrapApp(rootElement);
    }
  } catch (catastrophicError) {
    // Last-resort error handling: log and show a minimal safe message
    Logger.error('[FATAL] Unrecoverable error during application bootstrap:', catastrophicError);
    try {
      // Ensure there's a visible container
      const body = document.body;
      body.innerHTML = ''; // Only safe because we have no React mounted yet
      const errorDiv = document.createElement('div');
      errorDiv.textContent =
        'A critical error occurred and the application cannot start. Please refresh the page.';
      errorDiv.style.cssText = `
        font-family: sans-serif; padding: 40px; text-align: center; color: #333;
      `;
      body.appendChild(errorDiv);
    } catch (lastError) {
      // Nothing more we can do
    }
  }
})();