"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _ref = require("@rc-component/util/lib/ref");
var _Context = _interopRequireDefault(require("./Context"));
var _utils = require("../utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } // Seems this is used for iconFont
const Icon = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    // affect outter <i>...</i>
    className,
    // affect inner <svg>...</svg>
    component: Component,
    viewBox,
    spin,
    rotate,
    tabIndex,
    onClick,
    // children
    children,
    ...restProps
  } = props;
  const iconRef = React.useRef(null);
  const mergedRef = (0, _ref.useComposeRef)(iconRef, ref);
  (0, _utils.warning)(Boolean(Component || children), 'Should have `component` prop or `children`.');
  (0, _utils.useInsertStyles)(iconRef);
  const {
    prefixCls = 'anticon',
    rootClassName
  } = React.useContext(_Context.default);
  const classString = (0, _clsx.clsx)(rootClassName, prefixCls, {
    [`${prefixCls}-spin`]: !!spin && !!Component
  }, className);
  const svgClassString = (0, _clsx.clsx)({
    [`${prefixCls}-spin`]: !!spin
  });
  const svgStyle = rotate ? {
    msTransform: `rotate(${rotate}deg)`,
    transform: `rotate(${rotate}deg)`
  } : undefined;
  const innerSvgProps = {
    ..._utils.svgBaseProps,
    className: svgClassString,
    style: svgStyle,
    viewBox
  };
  if (!viewBox) {
    delete innerSvgProps.viewBox;
  }

  // component > children
  const renderInnerNode = () => {
    if (Component) {
      return /*#__PURE__*/React.createElement(Component, innerSvgProps, children);
    }
    if (children) {
      (0, _utils.warning)(Boolean(viewBox) || React.Children.count(children) === 1 && /*#__PURE__*/React.isValidElement(children) && React.Children.only(children).type === 'use', 'Make sure that you provide correct `viewBox`' + ' prop (default `0 0 1024 1024`) to the icon.');
      return /*#__PURE__*/React.createElement("svg", _extends({}, innerSvgProps, {
        viewBox: viewBox
      }), children);
    }
    return null;
  };
  let iconTabIndex = tabIndex;
  if (iconTabIndex === undefined && onClick) {
    iconTabIndex = -1;
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "img"
  }, restProps, {
    ref: mergedRef,
    tabIndex: iconTabIndex,
    onClick: onClick,
    className: classString
  }), renderInnerNode());
});
if (process.env.NODE_ENV !== 'production') {
  Icon.displayName = 'AntdIcon';
}
var _default = exports.default = Icon;