"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "_rs", {
  enumerable: true,
  get: function () {
    return _observerUtil._rs;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "useResizeObserver", {
  enumerable: true,
  get: function () {
    return _useResizeObserver.default;
  }
});
var React = _interopRequireWildcard(require("react"));
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _warning = require("@rc-component/util/lib/warning");
var _SingleObserver = _interopRequireDefault(require("./SingleObserver"));
var _Collection = require("./Collection");
var _observerUtil = require("./utils/observerUtil");
var _useResizeObserver = _interopRequireDefault(require("./useResizeObserver"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const INTERNAL_PREFIX_KEY = 'rc-observer-key';
function ResizeObserver(props, ref) {
  const {
    children
  } = props;
  const childNodes = typeof children === 'function' ? [children] : (0, _toArray.default)(children);
  if (process.env.NODE_ENV !== 'production') {
    if (childNodes.length > 1) {
      (0, _warning.warning)(false, 'Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.');
    } else if (childNodes.length === 0) {
      (0, _warning.warning)(false, '`children` of ResizeObserver is empty. Nothing is in observe.');
    }
  }
  return childNodes.map((child, index) => {
    const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`;
    return /*#__PURE__*/React.createElement(_SingleObserver.default, _extends({}, props, {
      key: key,
      ref: index === 0 ? ref : undefined
    }), child);
  });
}
const RefResizeObserver = /*#__PURE__*/React.forwardRef(ResizeObserver);
if (process.env.NODE_ENV !== 'production') {
  RefResizeObserver.displayName = 'ResizeObserver';
}
RefResizeObserver.Collection = _Collection.Collection;
var _default = exports.default = RefResizeObserver;