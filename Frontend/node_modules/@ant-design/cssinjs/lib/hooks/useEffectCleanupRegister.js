"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _warning = require("@rc-component/util/lib/warning");
var _react = require("react");
// DO NOT register functions in useEffect cleanup function, or functions that registered will never be called.
const useEffectCleanupRegister = deps => {
  const effectCleanups = [];
  let cleanupFlag = false;
  function register(fn) {
    if (cleanupFlag) {
      if (process.env.NODE_ENV !== 'production') {
        (0, _warning.warning)(false, '[Ant Design CSS-in-JS] You are registering a cleanup function after unmount, which will not have any effect.');
      }
      return;
    }
    effectCleanups.push(fn);
  }
  (0, _react.useEffect)(() => {
    // Compatible with strict mode
    cleanupFlag = false;
    return () => {
      cleanupFlag = true;
      if (effectCleanups.length) {
        effectCleanups.forEach(fn => fn());
      }
    };
  }, deps);
  return register;
};
var _default = exports.default = useEffectCleanupRegister;