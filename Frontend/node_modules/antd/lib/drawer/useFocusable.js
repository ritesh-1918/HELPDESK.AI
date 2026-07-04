"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useFocusable;
var _react = require("react");
function useFocusable(focusable, defaultTrap, legacyFocusTriggerAfterClose) {
  return (0, _react.useMemo)(() => {
    const ret = {
      trap: defaultTrap ?? true,
      focusTriggerAfterClose: legacyFocusTriggerAfterClose ?? true
    };
    return {
      ...ret,
      ...focusable
    };
  }, [focusable, defaultTrap, legacyFocusTriggerAfterClose]);
}