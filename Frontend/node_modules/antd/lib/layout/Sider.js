"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SiderContext = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _BarsOutlined = _interopRequireDefault(require("@ant-design/icons/BarsOutlined"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons/LeftOutlined"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons/RightOutlined"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
var _context = require("./context");
var _sider = _interopRequireDefault(require("./style/sider"));
const dimensionMaxMap = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px',
  xxxl: `1839.98px`
};
const isNumeric = val => !Number.isNaN(Number.parseFloat(val)) && Number.isFinite(Number(val));
const SiderContext = exports.SiderContext = /*#__PURE__*/React.createContext({});
const generateId = (() => {
  let i = 0;
  return (prefix = '') => {
    i += 1;
    return `${prefix}${i}`;
  };
})();
const Sider = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    trigger,
    children,
    defaultCollapsed = false,
    theme = 'dark',
    style = {},
    collapsible = false,
    reverseArrow = false,
    width = 200,
    collapsedWidth = 80,
    zeroWidthTriggerStyle,
    breakpoint,
    onCollapse,
    onBreakpoint,
    ...otherProps
  } = props;
  const {
    siderHook
  } = (0, _react.useContext)(_context.LayoutContext);
  const [collapsed, setCollapsed] = (0, _react.useState)('collapsed' in props ? props.collapsed : defaultCollapsed);
  const [below, setBelow] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    if ('collapsed' in props) {
      setCollapsed(props.collapsed);
    }
  }, [props.collapsed]);
  const handleSetCollapsed = (value, type) => {
    if (!('collapsed' in props)) {
      setCollapsed(value);
    }
    onCollapse?.(value, type);
  };
  // =========================== Prefix ===========================
  const {
    getPrefixCls,
    direction
  } = (0, _react.useContext)(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('layout-sider', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _sider.default)(prefixCls);
  // ========================= Responsive =========================
  const responsiveHandlerRef = (0, _react.useRef)(null);
  responsiveHandlerRef.current = mql => {
    setBelow(mql.matches);
    onBreakpoint?.(mql.matches);
    if (collapsed !== mql.matches) {
      handleSetCollapsed(mql.matches, 'responsive');
    }
  };
  (0, _react.useEffect)(() => {
    function responsiveHandler(mql) {
      return responsiveHandlerRef.current?.(mql);
    }
    let mql;
    if (typeof window?.matchMedia !== 'undefined' && breakpoint && breakpoint in dimensionMaxMap) {
      mql = window.matchMedia(`screen and (max-width: ${dimensionMaxMap[breakpoint]})`);
      if (typeof mql?.addEventListener === 'function') {
        mql.addEventListener('change', responsiveHandler);
      }
      responsiveHandler(mql);
    }
    return () => {
      if (typeof mql?.removeEventListener === 'function') {
        mql.removeEventListener('change', responsiveHandler);
      }
    };
  }, [breakpoint]); // in order to accept dynamic 'breakpoint' property, we need to add 'breakpoint' into dependency array.
  (0, _react.useEffect)(() => {
    const uniqueId = generateId('ant-sider-');
    siderHook.addSider(uniqueId);
    return () => siderHook.removeSider(uniqueId);
  }, []);
  const toggle = () => {
    handleSetCollapsed(!collapsed, 'clickTrigger');
  };
  const divProps = (0, _util.omit)(otherProps, ['collapsed']);
  const rawWidth = collapsed ? collapsedWidth : width;
  // use "px" as fallback unit for width
  const siderWidth = isNumeric(rawWidth) ? `${rawWidth}px` : String(rawWidth);
  // special trigger when collapsedWidth == 0
  const zeroWidthTrigger = Number.parseFloat(String(collapsedWidth || 0)) === 0 ? (/*#__PURE__*/React.createElement("span", {
    onClick: toggle,
    className: (0, _clsx.clsx)(`${prefixCls}-zero-width-trigger`, `${prefixCls}-zero-width-trigger-${reverseArrow ? 'right' : 'left'}`),
    style: zeroWidthTriggerStyle
  }, trigger || /*#__PURE__*/React.createElement(_BarsOutlined.default, null))) : null;
  const reverseIcon = direction === 'rtl' === !reverseArrow;
  const iconObj = {
    expanded: reverseIcon ? /*#__PURE__*/React.createElement(_RightOutlined.default, null) : /*#__PURE__*/React.createElement(_LeftOutlined.default, null),
    collapsed: reverseIcon ? /*#__PURE__*/React.createElement(_LeftOutlined.default, null) : /*#__PURE__*/React.createElement(_RightOutlined.default, null)
  };
  const status = collapsed ? 'collapsed' : 'expanded';
  const defaultTrigger = iconObj[status];
  const triggerDom = trigger !== null ? zeroWidthTrigger || (/*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-trigger`,
    onClick: toggle,
    style: {
      width: siderWidth
    }
  }, trigger || defaultTrigger)) : null;
  const divStyle = {
    ...style,
    flex: `0 0 ${siderWidth}`,
    maxWidth: siderWidth,
    // Fix width transition bug in IE11
    minWidth: siderWidth,
    // https://github.com/ant-design/ant-design/issues/6349
    width: siderWidth
  };
  const siderCls = (0, _clsx.clsx)(prefixCls, `${prefixCls}-${theme}`, {
    [`${prefixCls}-collapsed`]: !!collapsed,
    [`${prefixCls}-has-trigger`]: collapsible && trigger !== null && !zeroWidthTrigger,
    [`${prefixCls}-below`]: !!below,
    [`${prefixCls}-zero-width`]: Number.parseFloat(siderWidth) === 0
  }, className, hashId, cssVarCls);
  const contextValue = React.useMemo(() => ({
    siderCollapsed: collapsed
  }), [collapsed]);
  return /*#__PURE__*/React.createElement(SiderContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement("aside", {
    className: siderCls,
    ...divProps,
    style: divStyle,
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-children`
  }, children), collapsible || below && zeroWidthTrigger ? triggerDom : null));
});
if (process.env.NODE_ENV !== 'production') {
  Sider.displayName = 'Sider';
}
var _default = exports.default = Sider;