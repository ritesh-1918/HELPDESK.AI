const PATTERNS = [
  {
    regex: /\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|mariadb|redis|amqp|amqps):\/\/[^\s'"`<>]+/gi,
    replacement: '[REDACTED_CONNECTION_STRING]'
  },
  {
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: '[REDACTED_EMAIL]'
  },
  {
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
    replacement: '[REDACTED_IP_ADDRESS]'
  },
  {
    regex: /\b(?:sk_(?:live|test)|ghp|ghs|xox[baprs])[_-]?[A-Za-z0-9_-]{10,}\b/gi,
    replacement: '[REDACTED_CREDENTIALS]'
  },
  {
    regex: /\bBearer\s+[A-Za-z0-9._\-+/=]{10,}\b/gi,
    replacement: 'Bearer [REDACTED_CREDENTIALS]'
  },
  {
    regex: /\b(password|passwd|pass|secret|token|api[_-]?key)\s*([:=])\s*([^\s,;]+)/gi,
    replacement: (_, key, separator) => `${key}${separator} [REDACTED_CREDENTIALS]`
  }
];

export const anonymizeSensitiveText = (value = '') => {
  if (!value) return '';

  return PATTERNS.reduce((acc, pattern) => acc.replace(pattern.regex, pattern.replacement), value);
};
