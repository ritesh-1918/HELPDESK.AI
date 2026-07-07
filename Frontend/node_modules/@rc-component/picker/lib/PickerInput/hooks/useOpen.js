"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useOpen;
var _useDelayState3 = _interopRequireDefault(require("./useDelayState"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
/**
 * Control the open state.
 * Will not close if activeElement is on the popup.
 */
function useOpen(open, defaultOpen) {
  var disabledList = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var onOpenChange = arguments.length > 3 ? arguments[3] : undefined;
  var mergedOpen = disabledList.every(function (disabled) {
    return disabled;
  }) ? false : open;

  // Delay for handle the open state, in case fast shift from `open` -> `close` -> `open`
  // const [rafOpen, setRafOpen] = useLockState(open, defaultOpen || false, onOpenChange);
  var _useDelayState = (0, _useDelayState3.default)(mergedOpen, defaultOpen || false, onOpenChange),
    _useDelayState2 = _slicedToArray(_useDelayState, 2),
    rafOpen = _useDelayState2[0],
    setRafOpen = _useDelayState2[1];
  function setOpen(next) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!config.inherit || rafOpen) {
      setRafOpen(next, config.force);
    }
  }
  return [rafOpen, setOpen];
}