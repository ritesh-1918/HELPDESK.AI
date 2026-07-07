"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useLockEffect;
var _useLayoutEffect = require("@rc-component/util/lib/hooks/useLayoutEffect");
var _raf = _interopRequireDefault(require("@rc-component/util/lib/raf"));
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Trigger `callback` immediately when `condition` is `true`.
 * But trigger `callback` in next frame when `condition` is `false`.
 */
function useLockEffect(condition, callback) {
  var delayFrames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var callbackRef = React.useRef(callback);
  callbackRef.current = callback;
  (0, _useLayoutEffect.useLayoutUpdateEffect)(function () {
    if (condition) {
      callbackRef.current(condition);
    } else {
      var id = (0, _raf.default)(function () {
        callbackRef.current(condition);
      }, delayFrames);
      return function () {
        _raf.default.cancel(id);
      };
    }
  }, [condition]);
}