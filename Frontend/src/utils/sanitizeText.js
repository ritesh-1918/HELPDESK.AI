const DANGEROUS_BLOCK_PATTERN = /<(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi;
const HTML_TAG_PATTERN = /<\/?[^>]+>/g;
const EVENT_HANDLER_PATTERN = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_PROTOCOL_PATTERN = /\b(?:javascript|data|vbscript)\s*:/gi;

export function sanitizeDisplayText(value, fallback = '') {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value)
        .replace(DANGEROUS_BLOCK_PATTERN, '')
        .replace(EVENT_HANDLER_PATTERN, '')
        .replace(DANGEROUS_PROTOCOL_PATTERN, '')
        .replace(HTML_TAG_PATTERN, '')
        .trim();
}

export function safeDisplayText(value, fallback = '') {
    const sanitized = sanitizeDisplayText(value, fallback);
    return sanitized || fallback;
}
