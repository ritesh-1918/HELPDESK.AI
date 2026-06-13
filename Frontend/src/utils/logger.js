/**
 * Centralized logging utility to manage console logs across the application.
 * This intercepts native console methods to disable them in production
 * or route them to a monitoring service.
 */

const isProduction = import.meta.env.MODE === 'production';

class Logger {
    constructor() {
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug,
        };
    }

    /**
     * Overrides global console methods to prevent leaking data in production.
     * This avoids merge conflicts across 50+ files by centralizing the change.
     */
    setupGlobalLogger() {
        if (isProduction) {
            // Disable standard logs in production
            console.log = () => {};
            console.info = () => {};
            console.debug = () => {};
            
            // Optionally, intercept errors/warnings to send to monitoring like Sentry
            console.warn = (...args) => {
                // TODO: Send to monitoring service
                // this.originalConsole.warn(...args);
            };

            console.error = (...args) => {
                // TODO: Send to monitoring service
                // this.originalConsole.error(...args);
            };
        } else {
            // In development, keep standard behavior but we can format it if we want
            console.log = (...args) => this.originalConsole.log('[DEV]', ...args);
            console.error = (...args) => this.originalConsole.error('[DEV ERROR]', ...args);
            console.warn = (...args) => this.originalConsole.warn('[DEV WARN]', ...args);
            console.info = (...args) => this.originalConsole.info('[DEV INFO]', ...args);
        }
    }

    // Direct methods for future components to use directly
    log(...args) {
        if (!isProduction) this.originalConsole.log(...args);
    }
    
    error(...args) {
        if (!isProduction) this.originalConsole.error(...args);
    }
    
    warn(...args) {
        if (!isProduction) this.originalConsole.warn(...args);
    }
    
    info(...args) {
        if (!isProduction) this.originalConsole.info(...args);
    }
}

export const logger = new Logger();
export const setupGlobalLogger = () => logger.setupGlobalLogger();
