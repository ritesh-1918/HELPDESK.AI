"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Divider;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _MenuContext = require("./context/MenuContext");
var _PathContext = require("./context/PathContext");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Divider({
  className,
  style
}) {
  const {
    prefixCls
  } = React.useContext(_MenuContext.MenuContext);
  const measure = (0, _PathContext.useMeasure)();
  if (measure) {
    return null;
  }
  return /*#__PURE__*/React.createElement("li", {
    role: "separator",
    className: (0, _clsx.clsx)(`${prefixCls}-item-divider`, className),
    style: style
  });
}