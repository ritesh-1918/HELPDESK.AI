import * as React from 'react';

/**
 * Cache callback function that always return same ref instead.
 * This is used for context optimization.
 */
export default function useMemoCallback(func) {
  const funRef = React.useRef(func);
  funRef.current = func;
  const callback = React.useCallback((...args) => funRef.current?.(...args), []);
  return func ? callback : undefined;
}