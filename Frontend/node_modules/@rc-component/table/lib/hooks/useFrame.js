"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useLayoutState = useLayoutState;
exports.useTimeoutLock = useTimeoutLock;
var _react = require("react");
/**
 * Execute code before next frame but async
 */
function useLayoutState(defaultState) {
  const stateRef = (0, _react.useRef)(defaultState);
  const [, forceUpdate] = (0, _react.useState)({});
  const lastPromiseRef = (0, _react.useRef)(null);
  const updateBatchRef = (0, _react.useRef)([]);
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
  (0, _react.useEffect)(() => () => {
    lastPromiseRef.current = null;
  }, []);
  return [stateRef.current, setFrameState];
}

/** Lock frame, when frame pass reset the lock. */
function useTimeoutLock(defaultState) {
  const frameRef = (0, _react.useRef)(defaultState || null);
  const timeoutRef = (0, _react.useRef)(null);
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
  (0, _react.useEffect)(() => cleanUp, []);
  return [setState, getState];
}