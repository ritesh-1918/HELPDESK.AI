"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.StepIconSemanticContext = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _Context = require("./Context");
var _pickAttrs = _interopRequireDefault(require("@rc-component/util/lib/pickAttrs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const StepIconSemanticContext = exports.StepIconSemanticContext = /*#__PURE__*/React.createContext({});
const StepIcon = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    className,
    style,
    children,
    ...restProps
  } = props;
  const {
    prefixCls,
    classNames,
    styles
  } = React.useContext(_Context.StepsContext);
  const {
    className: itemClassName,
    style: itemStyle
  } = React.useContext(StepIconSemanticContext);
  const itemCls = `${prefixCls}-item`;
  return /*#__PURE__*/React.createElement("div", _extends({}, (0, _pickAttrs.default)(restProps, false), {
    ref: ref,
    className: (0, _clsx.clsx)(`${itemCls}-icon`, classNames.itemIcon, itemClassName, className),
    style: {
      ...styles.itemIcon,
      ...itemStyle,
      ...style
    }
  }), children);
});
var _default = exports.default = StepIcon;