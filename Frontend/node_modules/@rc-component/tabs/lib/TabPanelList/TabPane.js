"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var React = _interopRequireWildcard(require("react"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const TabPane = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    className,
    style,
    id,
    active,
    tabKey,
    children
  } = props;
  const hasContent = React.Children.count(children) > 0;
  return /*#__PURE__*/React.createElement("div", {
    id: id && `${id}-panel-${tabKey}`,
    role: "tabpanel",
    tabIndex: active && hasContent ? 0 : -1,
    "aria-labelledby": id && `${id}-tab-${tabKey}`,
    "aria-hidden": !active,
    style: style,
    className: (0, _clsx.clsx)(prefixCls, active && `${prefixCls}-active`, className),
    ref: ref
  }, children);
});
if (process.env.NODE_ENV !== 'production') {
  TabPane.displayName = 'TabPane';
}
var _default = exports.default = TabPane;