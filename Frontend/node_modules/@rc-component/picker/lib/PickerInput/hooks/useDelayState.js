"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDelayState;
var _util = require("@rc-component/util");
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
/**
 * Will be `true` immediately for next effect.
 * But will be `false` for a delay of effect.
 */
function useDelayState(value, defaultValue, onChange) {
  var _useControlledState = (0, _util.useControlledState)(defaultValue, value),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    state = _useControlledState2[0],
    setState = _useControlledState2[1];

  // Need force update to ensure React re-render
  var _React$useState = _react.default.useState({}),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    forceUpdate = _React$useState2[1];
  var triggerUpdate = (0, _util.useEvent)(function (nextState) {
    setState(nextState);
    forceUpdate({});
  });
  var nextValueRef = _react.default.useRef(value);

  // ============================= Update =============================
  var rafRef = _react.default.useRef();
  var cancelRaf = function cancelRaf() {
    _raf.default.cancel(rafRef.current);
  };
  var doUpdate = (0, _util.useEvent)(function () {
    triggerUpdate(nextValueRef.current);
    if (onChange && state !== nextValueRef.current) {
      onChange(nextValueRef.current);
    }
  });
  var updateValue = (0, _util.useEvent)(function (next, immediately) {
    cancelRaf();
    nextValueRef.current = next;
    if (next || immediately) {
      doUpdate();
    } else {
      rafRef.current = (0, _raf.default)(doUpdate);
    }
  });
  _react.default.useEffect(function () {
    return cancelRaf;
  }, []);
  return [state, updateValue];
}