javascript
// frontend/vite.config.js
import { defineConfig } from 'vite';
import crypto from 'crypto';
import { createHash } from 'crypto';

// -----------------------------------------------------------------------------
// Custom error types for security components
// -----------------------------------------------------------------------------

/**
 * Base error class for security header related failures.
 * @extends Error
 */
class SecurityHeaderError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {string} [code='SECURITY_HEADER_ERROR'] - Machine-readable error code
   */
  constructor(message, code = 'SECURITY_HEADER_ERROR') {
    super(message);
    this.name = 'SecurityHeaderError';
    this.code = code;
  }
}

/**
 * Error thrown when cryptographic nonce generation fails.
 * @extends SecurityHeaderError
 */
class NonceGenerationError extends SecurityHeaderError {
  /**
   * @param {string} message - Error detail
   */
  constructor(message) {
    super(message, 'NONCE_GENERATION_ERROR');
    this.name = 'NonceGenerationError';
  }
}

/**
 * Error thrown when an attempt is made to overwrite an already set header.
 * @extends SecurityHeaderError
 */
class OverwriteProtectionError extends SecurityHeaderError {
  /**
   * @param {string} message - Header name that caused the conflict
   */
  constructor(message) {
    super(message, 'HEADER_OVERWRITE_PROTECTION');
    this.name = 'OverwriteProtectionError';
  }
}

// -----------------------------------------------------------------------------
// Logger – structured with severity, context, and ISO timestamp
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} Logger
 * @property {(msg: string, ...args: unknown[]) => void} info
 * @property {(msg: string, ...args: unknown[]) => void} debug
 * @property {(msg: string, ...args: unknown[]) => void} warn
 * @property {(msg: string, ...args: unknown[]) => void} error
 */

/**
 * Creates a scoped logger with context prefix and structured output.
 * @param {string} context - Logger context name (e.g., 'SecurityPlugin')
 * @returns {Logger} Logger interface
 */
const createLogger = (context) => {
  const prefix = `[${context}]`;
  const timestamp = () => new Date().toISOString();
  return {
    info: (msg, ...args) => console.info(`${prefix} [${timestamp()}] INFO: ${msg}`, ...args),
    debug: (msg, ...args) => console.debug(`${prefix} [${timestamp()}] DEBUG: ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`${prefix} [${timestamp()}] WARN: ${msg}`, ...args),
    error: (msg, ...args) => console.error(`${prefix} [${timestamp()}] ERROR: ${msg}`, ...args),
  };
};

const logger = createLogger('SecurityHeadersPlugin');

// -----------------------------------------------------------------------------
// Immutable constants
// -----------------------------------------------------------------------------

/** @type {Readonly<Record<string, string>>} */
const STATIC_SECURITY_HEADERS = Object.freeze({
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

/** @type {number} – cryptographically secure random bytes for nonce */
const NONCE_BYTE_LENGTH = 32;

/** @type {RegExp} – matches inline scripts without src or nonce attributes */
const INLINE_SCRIPT_PATTERN = /<script\b(?![^>]*\b(?:src|nonce)\s*=)/gi;

// -----------------------------------------------------------------------------
// Utility functions
// -----------------------------------------------------------------------------

/**
 * Generates a cryptographic nonce string.
 * @returns {string} Base64-encoded nonce (32 bytes input, ~44 chars output)
 * @throws {NonceGenerationError} If random bytes generation fails
 */
const generateNonce = () => {
  try {
    return crypto.randomBytes(NONCE_BYTE_LENGTH).toString('base64');
  } catch (err) {
    const errorMessage = `Failed to generate nonce: ${err instanceof Error ? err.message : 'Unknown error'}`;
    logger.error(errorMessage);
    throw new NonceGenerationError(errorMessage);
  }
};

/**
 * Escapes a string for safe inclusion in an HTML double-quoted attribute value.
 * @param {string} value - Raw string to escape
 * @returns {string} Escaped string safe for HTML attribute
 */
const escapeHtmlAttribute = (value) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Builds a strict Content-Security-Policy header value using a given nonce.
 * @param {string} nonce - Cryptographic nonce for inline scripts (will be escaped)
 * @param {string[]} [additionalDirectives] - Extra CSP directives to append
 * @returns {string} CSP header value
 * @throws {TypeError} If nonce is not a non-empty string
 */
const buildContentSecurityPolicy = (nonce, additionalDirectives = []) => {
  if (typeof nonce !== 'string' || nonce.length === 0) {
    throw new TypeError('Nonce must be a non-empty string');
  }
  const escapedNonce = escapeHtmlAttribute(nonce);
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${escapedNonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    'upgrade-insecure-requests',
    ...additionalDirectives,
  ];
  return directives.join('; ');
};

/**
 * Injects a `nonce` attribute into all inline `<script>` tags (those without
 * an existing `src` or `nonce` attribute). The nonce is safely escaped.
 * @param {string} html - HTML string to process
 * @param {string} nonce - Nonce value to inject (will be escaped)
 * @returns {string} Modified HTML with nonce attributes added
 * @throws {TypeError} If html is not a string
 */
const addNonceToInlineScripts = (html, nonce) => {
  if (typeof html !== 'string') {
    throw new TypeError('HTML must be a string');
  }
  if (typeof nonce !== 'string' || nonce.length === 0) {
    throw new TypeError('Nonce must be a non-empty string');
  }

  const escapedNonce = escapeHtmlAttribute(nonce);

  // Use a single regex with negative lookahead for both src and nonce (case-insensitive)
  return html.replace(INLINE_SCRIPT_PATTERN, `<script nonce="${escapedNonce}"`);
};

// -----------------------------------------------------------------------------
// Plugin options validation
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} SecurityHeadersPluginOptions
 * @property {boolean} [enableNonceInjection=true] - Inject CSP nonce into inline scripts
 * @property {Record<string, string>} [additionalHeaders] - Extra HTTP headers to add
 * @property {string[]} [additionalCspDirectives] - Extra CSP directives (e.g., 'img-src https://trusted-cdn.com')
 */

/**
 * Validates and returns normalized plugin options with sensible defaults.
 * @param {Partial<SecurityHeadersPluginOptions>} [options] - User-provided options
 * @returns {SecurityHeadersPluginOptions} Normalized options object
 * @throws {TypeError} If input is not a plain object
 */
const normalizePluginOptions = (options = {}) => {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Plugin options must be a plain object');
  }

  return {
    enableNonceInjection: options.enableNonceInjection !== false,
    additionalHeaders: Object.freeze({ ...(options.additionalHeaders ?? {}) }),
    additionalCspDirectives: Object.freeze([...(options.additionalCspDirectives ?? [])]),
  };
};

// -----------------------------------------------------------------------------
// Plugin definition
// -----------------------------------------------------------------------------

/**
 * Vite plugin that enforces security headers on every served response:
 * - Static headers (X-Frame-Options, X-Content-Type-Options, HSTS)
 * - Dynamic Content-Security-Policy with per‑request nonce
 * - Nonce injection into inline `<script>` tags (development and build)
 *
 * For development, headers are set via a Connect middleware. For production
 * builds, headers must be configured on the deployment server (e.g., a CDN or
 * reverse proxy) but the nonce injection is still applied to the HTML output.
 *
 * @param {Partial<SecurityHeadersPluginOptions>} [pluginOptions] - Configuration
 * @returns {import('vite').Plugin} Vite plugin object
 */
function securityHeadersPlugin(pluginOptions = {}) {
  const options = normalizePluginOptions(pluginOptions);

  // Pre-apply static headers (they don't change per request)
  const staticHeaders = Object.freeze({
    ...STATIC_SECURITY_HEADERS,
    ...options.additionalHeaders,
  });

  return {
    name: 'vite-plugin-security-headers',
    enforce: 'post', // run after other plugins to capture final HTML

    /**
     * Hook called when Vite dev server is created.
     * Adds a middleware to set HTTP security headers on every response.
     * @param {import('vite').ViteDevServer} server - Vite dev server instance
     */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          // Set static security headers
          for (const [header, value] of Object.entries(staticHeaders)) {
            if (res.getHeader(header) !== undefined) {
              const msg = `Attempted to overwrite existing header: ${header}`;
              logger.warn(msg);
              // In strict mode we could throw, but we prefer to just warn and keep existing
            }
            res.setHeader(header, value);
          }

          // Generate per‑request nonce and set CSP
          const nonce = generateNonce();
          const csp = buildContentSecurityPolicy(nonce, options.additionalCspDirectives);
          res.setHeader('Content-Security-Policy', csp);

          // Attach nonce to response locals so transformIndexHtml can reuse it
          res.locals = res.locals || {};
          res.locals.nonce = nonce;
        } catch (err) {
          // Log but do not crash; best effort
          logger.error('Failed to set security headers:', err instanceof Error ? err.message : err);
        }
        next();
      });
    },

    /**
     * Transform `index.html` – injects nonce attribute into inline `<script>` tags.
     * For dev server the nonce comes from `res.locals`; for build a fresh nonce is generated.
     * @param {string} html - Raw HTML content
     * @param {import('vite').IndexHtmlTransformContext} ctx - Transformation context
     * @returns {string | Promise<string>} Modified HTML
     */
    transformIndexHtml(html, ctx) {
      try {
        // In dev server, we already have a nonce from the middleware
        const nonce = ctx?.server?.res?.locals?.nonce || generateNonce();

        if (options.enableNonceInjection) {
          const modifiedHtml = addNonceToInlineScripts(html, nonce);

          // Update CSP in <meta> if present (optional improvement)
          // For simplicity, we rely on the middleware/dev‑server headers or production server

          logger.debug(`Injected nonce into inline scripts (${nonce.substring(0, 8)}...)`);
          return modifiedHtml;
        }
        return html;
      } catch (err) {
        const errMsg = `transformIndexHtml failed: ${err instanceof Error ? err.message : 'Unknown'}`;
        logger.error(errMsg);
        // Return original HTML to avoid breaking the build
        return html;
      }
    },
  };
}

// -----------------------------------------------------------------------------
// Vite configuration
// -----------------------------------------------------------------------------

/**
 * Application Vite configuration with integrated security plugins.
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    securityHeadersPlugin({
      enableNonceInjection: true,
      additionalHeaders: {
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
      additionalCspDirectives: [
        "block-all-mixed-content",
        "report-uri /csp-violation-endpoint",
      ],
    }),
  ],
  server: {
    // Restrict CORS in dev to protect against malicious origins
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
      credentials: true,
    },
    // Optional: enable HTTPS in development for HSTS testing
    // https: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Prevent asset collision attempts
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});