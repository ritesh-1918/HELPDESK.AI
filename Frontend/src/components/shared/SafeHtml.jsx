import React, { useMemo } from 'react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

/**
 * SafeHtml — renders sanitized HTML from ticket summaries and logs.
 *
 * Prevents XSS by running all content through the HTML sanitizer before
 * injecting via dangerouslySetInnerHTML. Never use dangerouslySetInnerHTML
 * with raw ticket content directly — always use this component.
 *
 * @param {object} props
 * @param {string} props.html  - Raw HTML string from ticket log / AI summary.
 * @param {string} [props.className] - Optional CSS class name.
 * @param {string} [props.as]  - HTML tag to render as (default: "div").
 *
 * @example
 * <SafeHtml html={ticket.summary} className="ticket-summary" />
 */
export default function SafeHtml({ html, className, as: Tag = 'div' }) {
  const sanitized = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
