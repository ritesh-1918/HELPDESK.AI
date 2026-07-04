import * as React from 'react';

/**
 * Same as `React.useCallback` but always return a memoized function
 * but redirect to real function.
 */
export default function useRefFunc(callback) {
  const funcRef = React.useRef();
  funcRef.current = callback;
  const cacheFn = React.useCallback((...args) => {
    return funcRef.current(...args);
  }, []);
  return cacheFn;
}