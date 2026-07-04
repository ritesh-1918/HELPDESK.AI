import { useRef, useState, useEffect } from 'react';
/**
 * Execute code before next frame but async
 */
export function useLayoutState(defaultState) {
  const stateRef = useRef(defaultState);
  const [, forceUpdate] = useState({});
  const lastPromiseRef = useRef(null);
  const updateBatchRef = useRef([]);
  function setFrameState(updater) {
    updateBatchRef.current.push(updater);
    const promise = Promise.resolve();
    lastPromiseRef.current = promise;
    promise.then(() => {
      if (lastPromiseRef.current === promise) {
        const prevBatch = updateBatchRef.current;
        const prevState = stateRef.current;
        updateBatchRef.current = [];
        prevBatch.forEach(batchUpdater => {
          stateRef.current = batchUpdater(stateRef.current);
        });
        lastPromiseRef.current = null;
        if (prevState !== stateRef.current) {
          forceUpdate({});
        }
      }
    });
  }
  useEffect(() => () => {
    lastPromiseRef.current = null;
  }, []);
  return [stateRef.current, setFrameState];
}

/** Lock frame, when frame pass reset the lock. */
export function useTimeoutLock(defaultState) {
  const frameRef = useRef(defaultState || null);
  const timeoutRef = useRef(null);
  function cleanUp() {
    clearTimeout(timeoutRef.current);
  }
  function setState(newState) {
    frameRef.current = newState;
    cleanUp();
    timeoutRef.current = setTimeout(() => {
      frameRef.current = null;
      timeoutRef.current = undefined;
    }, 100);
  }
  function getState() {
    return frameRef.current;
  }
  useEffect(() => cleanUp, []);
  return [setState, getState];
}