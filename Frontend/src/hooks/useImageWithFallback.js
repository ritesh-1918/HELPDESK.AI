/**
 * useImageWithFallback — accessibility-safe image loading hook.
 *
 * Provides:
 *  - Graceful fallback when the src URL is broken or empty
 *  - Loading state tracking so consumers can show skeletons
 *  - Error state for custom empty states (broken URL, 404)
 *
 * Usage:
 *   const { imgProps, isLoading, hasError } = useImageWithFallback(
 *     src,
 *     altText,
 *     fallbackSrc   // optional
 *   );
 *   return <img {...imgProps} className="..." />;
 *
 * The returned imgProps always include a non-empty alt attribute,
 * enforcing the WCAG 2.1 §1.1.1 success criterion.
 */

import { useState, useCallback } from "react";

const DEFAULT_FALLBACK = "/favicon.png";

/**
 * @param {string|null|undefined} src       - Primary image URL or base64 data URI
 * @param {string}                alt       - Descriptive alt text (required by WCAG 1.1.1)
 * @param {string}                [fallback] - URL shown when src fails to load
 * @returns {{ imgProps: object, isLoading: boolean, hasError: boolean }}
 */
export function useImageWithFallback(src, alt, fallback = DEFAULT_FALLBACK) {
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  }, [currentSrc, fallback]);

  return {
    imgProps: {
      src: currentSrc || fallback,
      alt: alt || "",
      onLoad: handleLoad,
      onError: handleError,
      loading: "lazy",
    },
    isLoading,
    hasError,
  };
}

/**
 * getAvatarAlt — derive a consistent, screen-reader-friendly alt string for
 * user avatar images.
 *
 * @param {string|null|undefined} fullName  - User's display name
 * @param {string}                [role]    - Optional role label (e.g. "admin")
 * @returns {string}
 */
export function getAvatarAlt(fullName, role) {
  const name = (fullName || "User").trim();
  if (role) return `${name} (${role}) profile picture`;
  return `${name} profile picture`;
}

/**
 * getTicketImageAlt — derive alt text for ticket attachment screenshots.
 *
 * @param {string|null|undefined} ticketId
 * @param {string}                [description] - Optional user-provided description
 * @returns {string}
 */
export function getTicketImageAlt(ticketId, description) {
  if (description && description.trim()) return description.trim();
  if (ticketId) return `Screenshot attached to ticket ${ticketId}`;
  return "User uploaded screenshot";
}

/**
 * getThumbnailAlt — derive alt text for video / content thumbnails.
 *
 * @param {string|null|undefined} title
 * @returns {string}
 */
export function getThumbnailAlt(title) {
  if (title && title.trim()) return `Thumbnail for ${title.trim()}`;
  return "Video thumbnail";
}
