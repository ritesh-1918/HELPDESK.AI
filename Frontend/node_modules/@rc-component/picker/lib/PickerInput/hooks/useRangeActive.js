"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useRangeActive;
var React = _interopRequireWildcard(require("react"));
var _useLockEffect = _interopRequireDefault(require("./useLockEffect"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
/**
 * When user first focus one input, any submit will trigger focus another one.
 * When second time focus one input, submit will not trigger focus again.
 * When click outside to close the panel, trigger event if it can trigger onChange.
 */
function useRangeActive(disabled) {
  var empty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var mergedOpen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var _React$useState = React.useState(0),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    activeIndex = _React$useState2[0],
    setActiveIndex = _React$useState2[1];
  var _React$useState3 = React.useState(false),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    focused = _React$useState4[0],
    setFocused = _React$useState4[1];
  var activeListRef = React.useRef([]);
  var submitIndexRef = React.useRef(null);
  var lastOperationRef = React.useRef(null);
  var updateSubmitIndex = function updateSubmitIndex(index) {
    submitIndexRef.current = index;
  };
  var hasActiveSubmitValue = function hasActiveSubmitValue(index) {
    return submitIndexRef.current === index;
  };
  var triggerFocus = function triggerFocus(nextFocus) {
    setFocused(nextFocus);
  };

  // ============================= Record =============================
  var lastOperation = function lastOperation(type) {
    if (type) {
      lastOperationRef.current = type;
    }
    return lastOperationRef.current;
  };

  // ============================ Strategy ============================
  // Trigger when input enter or input blur or panel close
  var nextActiveIndex = function nextActiveIndex(nextValue) {
    var list = activeListRef.current;
    var filledActiveSet = new Set(list.filter(function (index) {
      return nextValue[index] || empty[index];
    }));
    var nextIndex = list[list.length - 1] === 0 ? 1 : 0;
    if (filledActiveSet.size >= 2 || disabled[nextIndex]) {
      return null;
    }
    return nextIndex;
  };

  // ============================= Effect =============================
  // Wait in case it's from the click outside to blur
  (0, _useLockEffect.default)(focused || mergedOpen, function () {
    if (!focused) {
      activeListRef.current = [];
      updateSubmitIndex(null);
    }
  });
  React.useEffect(function () {
    if (focused) {
      activeListRef.current.push(activeIndex);
    }
  }, [focused, activeIndex]);
  return [focused, triggerFocus, lastOperation, activeIndex, setActiveIndex, nextActiveIndex, activeListRef.current, updateSubmitIndex, hasActiveSubmitValue];
}