/**
 * sanitizeHtml.js
 *
 * Lightweight HTML sanitizer to prevent XSS when rendering raw ticket
 * summaries and log content. Strips all disallowed tags and dangerous
 * attributes (e.g. onerror, onclick, href="javascript:...").
 *
 * Use this everywhere user-supplied or AI-generated HTML is rendered
 * via dangerouslySetInnerHTML or injected into the DOM.
 */

/** Tags whose content is always stripped entirely (including inner text). */
const BLOCKED_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed',
  'form', 'input', 'button', 'select', 'textarea',
  'link', 'meta', 'base', 'noscript', 'template',
]);

/** Tags that are allowed to pass through with safe attributes only. */
const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'caption', 'code', 'col',
  'colgroup', 'dd', 'div', 'dl', 'dt', 'em', 'figcaption',
  'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
  'i', 'img', 'li', 'ol', 'p', 'pre', 'q', 's', 'small',
  'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
  'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
]);

/** Attributes allowed globally on any element. */
const ALLOWED_ATTRS = new Set([
  'class', 'id', 'title', 'alt', 'width', 'height',
  'colspan', 'rowspan', 'scope', 'align', 'valign',
  'src', 'href', 'target', 'rel',
]);

/** Patterns that indicate a dangerous attribute value. */
const DANGEROUS_VALUE = /^(javascript:|data:|vbscript:)/i;

/** Attributes that are always stripped regardless of tag. */
const BLOCKED_ATTRS = /^on/i; // blocks onclick, onerror, onload, etc.

/**
 * Sanitize a single DOM element in-place.
 * @param {Element} el
 */
function sanitizeElement(el) {
  const tagName = el.tagName.toLowerCase();

  // Completely remove blocked tags along with their children
  if (BLOCKED_TAGS.has(tagName)) {
    el.remove();
    return;
  }

  // Remove unknown / non-allow-listed tags but keep their text content
  if (!ALLOWED_TAGS.has(tagName)) {
    el.replaceWith(...el.childNodes);
    return;
  }

  // Sanitize attributes
  for (const attr of [...el.attributes]) {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    if (BLOCKED_ATTRS.test(name) || !ALLOWED_ATTRS.has(name)) {
      el.removeAttribute(attr.name);
      continue;
    }

    // Block javascript: / data: / vbscript: URLs
    if ((name === 'href' || name === 'src') && DANGEROUS_VALUE.test(value.trim())) {
      el.removeAttribute(attr.name);
      continue;
    }

    // Force safe target / rel on external links
    if (tagName === 'a' && name === 'href') {
      el.setAttribute('rel', 'noopener noreferrer');
      if (!el.hasAttribute('target')) {
        el.setAttribute('target', '_blank');
      }
    }
  }

  // Recurse into children
  for (const child of [...el.children]) {
    sanitizeElement(child);
  }
}

/**
 * Sanitize an HTML string and return safe HTML.
 *
 * @param {string} dirty - Raw, potentially unsafe HTML string.
 * @returns {string} Sanitized HTML safe for rendering.
 *
 * @example
 * const safe = sanitizeHtml('<p>Hello <script>alert(1)</script></p>');
 * // => '<p>Hello </p>'
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  // Use a sandboxed template element to parse without executing scripts
  const template = document.createElement('template');
  template.innerHTML = dirty;

  const fragment = template.content;

  for (const child of [...fragment.children]) {
    sanitizeElement(child);
  }

  // Serialize back to string
  const wrapper = document.createElement('div');
  wrapper.appendChild(fragment.cloneNode(true));
  return wrapper.innerHTML;
}

/**
 * Escape a plain-text string so it is safe to insert as HTML text content.
 * Use this when you want to display raw ticket data as text (not rendered HTML).
 *
 * @param {string} text - Untrusted plain text.
 * @returns {string} HTML-escaped string.
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
