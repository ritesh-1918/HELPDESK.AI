"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _omit = _interopRequireDefault(require("@rc-component/util/lib/omit"));
var React = _interopRequireWildcard(require("react"));
var _MenuContext = require("./context/MenuContext");
var _PathContext = require("./context/PathContext");
var _commonUtil = require("./utils/commonUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const InternalMenuItemGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    className,
    title,
    eventKey,
    children,
    ...restProps
  } = props;
  const {
    prefixCls,
    classNames: menuClassNames,
    styles
  } = React.useContext(_MenuContext.MenuContext);
  const groupPrefixCls = `${prefixCls}-item-group`;
  return /*#__PURE__*/React.createElement("li", _extends({
    ref: ref,
    role: "presentation"
  }, restProps, {
    onClick: e => e.stopPropagation(),
    className: (0, _clsx.clsx)(groupPrefixCls, className)
  }), /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    className: (0, _clsx.clsx)(`${groupPrefixCls}-title`, menuClassNames?.listTitle),
    style: styles?.listTitle,
    title: typeof title === 'string' ? title : undefined
  }, title), /*#__PURE__*/React.createElement("ul", {
    role: "group",
    className: (0, _clsx.clsx)(`${groupPrefixCls}-list`, menuClassNames?.list),
    style: styles?.list
  }, children));
});
const MenuItemGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    eventKey,
    children
  } = props;
  const connectedKeyPath = (0, _PathContext.useFullPath)(eventKey);
  const childList = (0, _commonUtil.parseChildren)(children, connectedKeyPath);
  const measure = (0, _PathContext.useMeasure)();
  if (measure) {
    return childList;
  }
  return /*#__PURE__*/React.createElement(InternalMenuItemGroup, _extends({
    ref: ref
  }, (0, _omit.default)(props, ['warnKey'])), childList);
});
if (process.env.NODE_ENV !== 'production') {
  MenuItemGroup.displayName = 'MenuItemGroup';
}
var _default = exports.default = MenuItemGroup;