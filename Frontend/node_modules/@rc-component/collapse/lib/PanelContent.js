"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _react = _interopRequireDefault(require("react"));
const PanelContent = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    prefixCls,
    forceRender,
    className,
    style,
    children,
    isActive,
    role,
    classNames: customizeClassNames,
    styles
  } = props;
  const [rendered, setRendered] = _react.default.useState(isActive || forceRender);
  _react.default.useEffect(() => {
    if (forceRender || isActive) {
      setRendered(true);
    }
  }, [forceRender, isActive]);
  if (!rendered) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: ref,
    className: (0, _clsx.clsx)(`${prefixCls}-panel`, {
      [`${prefixCls}-panel-active`]: isActive,
      [`${prefixCls}-panel-inactive`]: !isActive
    }, className),
    style: style,
    role: role
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-body`, customizeClassNames?.body),
    style: styles?.body
  }, children));
});
if (process.env.NODE_ENV !== 'production') {
  PanelContent.displayName = 'PanelContent';
}
var _default = exports.default = PanelContent;