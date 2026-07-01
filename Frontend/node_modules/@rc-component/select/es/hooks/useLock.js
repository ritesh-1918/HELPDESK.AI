import * as React from 'react';

/**
 * Locker return cached mark.
 * If set to `true`, will return `true` in a short time even if set `false`.
 * If set to `false` and then set to `true`, will change to `true`.
 * And after time duration, it will back to `null` automatically.
 */
export default function useLock(duration = 250) {
  const lockRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  // Clean up
  React.useEffect(() => () => {
    window.clearTimeout(timeoutRef.current);
  }, []);
  function doLock(locked) {
    if (locked || lockRef.current === null) {
      lockRef.current = locked;
    }
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      lockRef.current = null;
    }, duration);
  }
  return [() => lockRef.current, doLock];
}