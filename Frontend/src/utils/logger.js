const isProd = import.meta.env.PROD;

export const logger = {
  log: (...args) => {
    if (!isProd) console.log(...args);
  },
  info: (...args) => {
    if (!isProd) console.info(...args);
  },
  warn: (...args) => {
    if (!isProd) console.warn(...args);
  },
  // In production only the error message string is emitted — never raw objects
  // that may contain user data (emails, ticket text, tokens).
  error: (message, err) => {
    if (!isProd) {
      console.error(message, err);
    } else {
      console.error(message, err instanceof Error ? err.message : String(err ?? ''));
    }
  },
};

export default logger;
