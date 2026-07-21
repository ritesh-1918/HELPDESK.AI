"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useControlledState;
var _react = require("react");
var _useLayoutEffect = _interopRequireDefault(require("./useLayoutEffect"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Similar to `useState` but will use props value if provided.
 * From React 18, we do not need safe `useState` since it will not throw for unmounted update.
 * This hooks remove the `onChange` & `postState` logic since we only need basic merged state logic.
 */
function useControlledState(defaultStateValue, value) {
  const [innerValue, setInnerValue] = (0, _react.useState)(defaultStateValue);
  const mergedValue = value !== undefined ? value : innerValue;
  (0, _useLayoutEffect.default)(mount => {
    if (!mount) {
      setInnerValue(value);
    }
  }, [value]);
  return [
  // Value
  mergedValue,
  // Update function
  setInnerValue];
}