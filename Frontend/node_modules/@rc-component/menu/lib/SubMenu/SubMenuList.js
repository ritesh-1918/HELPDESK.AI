"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _MenuContext = require("../context/MenuContext");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const InternalSubMenuList = ({
  className,
  children,
  ...restProps
}, ref) => {
  const {
    prefixCls,
    mode,
    rtl
  } = React.useContext(_MenuContext.MenuContext);
  return /*#__PURE__*/React.createElement("ul", _extends({
    className: (0, _clsx.clsx)(prefixCls, rtl && `${prefixCls}-rtl`, `${prefixCls}-sub`, `${prefixCls}-${mode === 'inline' ? 'inline' : 'vertical'}`, className),
    role: "menu"
  }, restProps, {
    "data-menu-list": true,
    ref: ref
  }), children);
};
const SubMenuList = /*#__PURE__*/React.forwardRef(InternalSubMenuList);
if (process.env.NODE_ENV !== 'production') {
  SubMenuList.displayName = 'SubMenuList';
}
var _default = exports.default = SubMenuList;