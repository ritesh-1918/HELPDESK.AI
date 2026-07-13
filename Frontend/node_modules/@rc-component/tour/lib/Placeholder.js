"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _portal = _interopRequireDefault(require("@rc-component/portal"));
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Placeholder = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    open,
    autoLock,
    getContainer,
    domRef,
    className,
    style,
    fallbackDOM
  } = props;
  React.useImperativeHandle(ref, () => domRef.current || fallbackDOM());
  return /*#__PURE__*/React.createElement(_portal.default, {
    open: open,
    autoLock: autoLock,
    getContainer: getContainer
  }, /*#__PURE__*/React.createElement("div", {
    ref: domRef,
    className: className,
    style: style
  }));
});
if (process.env.NODE_ENV !== 'production') {
  Placeholder.displayName = 'Placeholder';
}
var _default = exports.default = Placeholder;