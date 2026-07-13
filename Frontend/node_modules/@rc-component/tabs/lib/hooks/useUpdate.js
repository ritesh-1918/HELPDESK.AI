"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useUpdate;
exports.useUpdateState = useUpdateState;
var _useLayoutEffect = require("@rc-component/util/lib/hooks/useLayoutEffect");
var _react = require("react");
/**
 * Help to merge callback with `useLayoutEffect`.
 * One time will only trigger once.
 */
function useUpdate(callback) {
  const [count, setCount] = (0, _react.useState)(0);
  const effectRef = (0, _react.useRef)(0);
  const callbackRef = (0, _react.useRef)();
  callbackRef.current = callback;

  // Trigger on `useLayoutEffect`
  (0, _useLayoutEffect.useLayoutUpdateEffect)(() => {
    callbackRef.current?.();
  }, [count]);

  // Trigger to update count
  return () => {
    if (effectRef.current !== count) {
      return;
    }
    effectRef.current += 1;
    setCount(effectRef.current);
  };
}
function useUpdateState(defaultState) {
  const batchRef = (0, _react.useRef)([]);
  const [, forceUpdate] = (0, _react.useState)({});
  const state = (0, _react.useRef)(typeof defaultState === 'function' ? defaultState() : defaultState);
  const flushUpdate = useUpdate(() => {
    let current = state.current;
    batchRef.current.forEach(callback => {
      current = callback(current);
    });
    batchRef.current = [];
    state.current = current;
    forceUpdate({});
  });
  function updater(callback) {
    batchRef.current.push(callback);
    flushUpdate();
  }
  return [state.current, updater];
}