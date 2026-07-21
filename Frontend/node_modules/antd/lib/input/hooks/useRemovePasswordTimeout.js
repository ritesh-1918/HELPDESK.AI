"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useRemovePasswordTimeout;
var _react = require("react");
function useRemovePasswordTimeout(inputRef, triggerOnMount) {
  const removePasswordTimeoutRef = (0, _react.useRef)([]);
  const removePasswordTimeout = () => {
    removePasswordTimeoutRef.current.push(setTimeout(() => {
      if (inputRef.current?.input && inputRef.current?.input.getAttribute('type') === 'password' && inputRef.current?.input.hasAttribute('value')) {
        inputRef.current?.input.removeAttribute('value');
      }
    }));
  };
  (0, _react.useEffect)(() => {
    if (triggerOnMount) {
      removePasswordTimeout();
    }
    return () => removePasswordTimeoutRef.current.forEach(timer => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }, []);
  return removePasswordTimeout;
}