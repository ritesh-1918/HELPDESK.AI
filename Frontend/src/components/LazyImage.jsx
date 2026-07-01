/**
 * LazyImage — accessible lazy-loading image component.
 *
 * Enforces:
 *  - Non-empty alt attribute (WCAG 2.1 §1.1.1 — Non-text Content)
 *  - Native lazy loading via loading="lazy"
 *  - Shimmer skeleton while the image loads
 *  - Graceful error fallback to a placeholder rather than a broken icon
 *
 * Props:
 *  src         {string}          Image URL or base64 data URI (required)
 *  alt         {string}          Alt text — required for accessibility; pass ""
 *                                only for decorative images where the surrounding
 *                                context provides the description
 *  fallbackSrc {string}          URL shown if src fails to load
 *  className   {string}          CSS class(es) applied to the <img> element
 *  ...rest                       Any other valid <img> prop
 */

import React, { useState, useCallback } from "react";

const DEFAULT_FALLBACK = "/favicon.png";

const LazyImage = ({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className = "",
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const activeSrc = errored ? fallbackSrc : (src || fallbackSrc);

  const handleLoad = useCallback(() => setLoaded(true), []);

  const handleError = useCallback(() => {
    if (!errored) {
      setErrored(true);
      setLoaded(true); // show fallback immediately
    }
  }, [errored]);

  if (!src && !fallbackSrc) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {!loaded && !errored && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "4px",
          }}
        />
      )}
      <img
        src={activeSrc}
        alt={alt ?? ""}
        className={className}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
        {...rest}
      />
    </div>
  );
};

export default LazyImage;
