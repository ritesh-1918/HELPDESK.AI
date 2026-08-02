"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _tooltip = require("@rc-component/tooltip");
var _clsx = require("clsx");
var _hooks = require("../_util/hooks");
var _configProvider = require("../config-provider");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _style = _interopRequireDefault(require("./style"));
var _util = require("./util");
/** @private Internal Component. Do not use in your production. */
const PurePanel = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    placement = 'top',
    title,
    color,
    overlayInnerStyle,
    classNames,
    styles
  } = props;
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('tooltip', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  // Color
  const colorInfo = (0, _util.parseColor)(rootPrefixCls, prefixCls, color);
  const arrowContentStyle = colorInfo.arrowStyle;
  const innerStyles = React.useMemo(() => {
    const mergedStyle = {
      ...overlayInnerStyle,
      ...colorInfo.overlayStyle
    };
    return {
      container: mergedStyle
    };
  }, [overlayInnerStyle, colorInfo.overlayStyle]);
  const mergedProps = {
    ...props,
    placement
  };
  const [mergedClassNames, mergedStyles] = (0, _hooks.useMergeSemantic)([classNames], [innerStyles, styles], {
    props: mergedProps
  });
  const rootClassName = (0, _clsx.clsx)(rootCls, hashId, cssVarCls, prefixCls, `${prefixCls}-pure`, `${prefixCls}-placement-${placement}`, className, colorInfo.className);
  return /*#__PURE__*/React.createElement("div", {
    className: rootClassName,
    style: arrowContentStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: `${prefixCls}-arrow`
  }), /*#__PURE__*/React.createElement(_tooltip.Popup, {
    ...props,
    className: hashId,
    prefixCls: prefixCls,
    classNames: mergedClassNames,
    styles: mergedStyles
  }, title));
};
var _default = exports.default = PurePanel;