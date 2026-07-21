"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useMergedState;
var _useEvent = _interopRequireDefault(require("./useEvent"));
var _useLayoutEffect = require("./useLayoutEffect");
var _useState = _interopRequireDefault(require("./useState"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/** We only think `undefined` is empty */
function hasValue(value) {
  return value !== undefined;
}

/**
 * @deprecated Please use `useControlledState` instead if not need support < React 18.
 * Similar to `useState` but will use props value if provided.
 * Note that internal use rc-util `useState` hook.
 */
function useMergedState(defaultStateValue, option) {
  const {
    defaultValue,
    value,
    onChange,
    postState
  } = option || {};

  // ======================= Init =======================
  const [innerValue, setInnerValue] = (0, _useState.default)(() => {
    if (hasValue(value)) {
      return value;
    } else if (hasValue(defaultValue)) {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    } else {
      return typeof defaultStateValue === 'function' ? defaultStateValue() : defaultStateValue;
    }
  });
  const mergedValue = value !== undefined ? value : innerValue;
  const postMergedValue = postState ? postState(mergedValue) : mergedValue;

  // ====================== Change ======================
  const onChangeFn = (0, _useEvent.default)(onChange);
  const [prevValue, setPrevValue] = (0, _useState.default)([mergedValue]);
  (0, _useLayoutEffect.useLayoutUpdateEffect)(() => {
    const prev = prevValue[0];
    if (innerValue !== prev) {
      onChangeFn(innerValue, prev);
    }
  }, [prevValue]);

  // Sync value back to `undefined` when it from control to un-control
  (0, _useLayoutEffect.useLayoutUpdateEffect)(() => {
    if (!hasValue(value)) {
      setInnerValue(value);
    }
  }, [value]);

  // ====================== Update ======================
  const triggerChange = (0, _useEvent.default)((updater, ignoreDestroy) => {
    setInnerValue(updater, ignoreDestroy);
    setPrevValue([mergedValue], ignoreDestroy);
  });
  return [postMergedValue, triggerChange];
}