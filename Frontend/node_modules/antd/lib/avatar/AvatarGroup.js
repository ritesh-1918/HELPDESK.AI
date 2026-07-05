"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _reactNode = require("../_util/reactNode");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _useCSSVarCls = _interopRequireDefault(require("../config-provider/hooks/useCSSVarCls"));
var _popover = _interopRequireDefault(require("../popover"));
var _Avatar = _interopRequireDefault(require("./Avatar"));
var _AvatarContext = _interopRequireDefault(require("./AvatarContext"));
var _style = _interopRequireDefault(require("./style"));
const AvatarContextProvider = props => {
  const {
    size,
    shape
  } = React.useContext(_AvatarContext.default);
  const avatarContextValue = React.useMemo(() => ({
    size: props.size || size,
    shape: props.shape || shape
  }), [props.size, props.shape, size, shape]);
  return /*#__PURE__*/React.createElement(_AvatarContext.default.Provider, {
    value: avatarContextValue
  }, props.children);
};
const AvatarGroup = props => {
  const {
    getPrefixCls,
    direction
  } = React.useContext(_configProvider.ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    maxCount,
    maxStyle,
    size,
    shape,
    maxPopoverPlacement,
    maxPopoverTrigger,
    children,
    max
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Avatar.Group');
    [['maxCount', 'max={{ count: number }}'], ['maxStyle', 'max={{ style: CSSProperties }}'], ['maxPopoverPlacement', 'max={{ popover: PopoverProps }}'], ['maxPopoverTrigger', 'max={{ popover: PopoverProps }}']].forEach(([deprecatedName, newName]) => {
      warning.deprecated(!(deprecatedName in props), deprecatedName, newName);
    });
  }
  const prefixCls = getPrefixCls('avatar', customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-group`;
  const rootCls = (0, _useCSSVarCls.default)(prefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls, rootCls);
  const cls = (0, _clsx.clsx)(groupPrefixCls, {
    [`${groupPrefixCls}-rtl`]: direction === 'rtl'
  }, cssVarCls, rootCls, className, rootClassName, hashId);
  const childrenWithProps = (0, _util.toArray)(children).map((child, index) => (0, _reactNode.cloneElement)(child, {
    // eslint-disable-next-line react/no-array-index-key
    key: `avatar-key-${index}`
  }));
  const mergeCount = max?.count || maxCount;
  const numOfChildren = childrenWithProps.length;
  if (mergeCount && mergeCount < numOfChildren) {
    const childrenShow = childrenWithProps.slice(0, mergeCount);
    const childrenHidden = childrenWithProps.slice(mergeCount, numOfChildren);
    const mergeStyle = max?.style || maxStyle;
    const mergePopoverTrigger = max?.popover?.trigger || maxPopoverTrigger || 'hover';
    const mergePopoverPlacement = max?.popover?.placement || maxPopoverPlacement || 'top';
    const popoverProps = {
      content: childrenHidden,
      ...max?.popover,
      placement: mergePopoverPlacement,
      trigger: mergePopoverTrigger,
      rootClassName: (0, _clsx.clsx)(`${groupPrefixCls}-popover`, max?.popover?.rootClassName)
    };
    childrenShow.push(/*#__PURE__*/React.createElement(_popover.default, {
      key: "avatar-popover-key",
      destroyOnHidden: true,
      ...popoverProps
    }, /*#__PURE__*/React.createElement(_Avatar.default, {
      style: mergeStyle
    }, `+${numOfChildren - mergeCount}`)));
    return /*#__PURE__*/React.createElement(AvatarContextProvider, {
      shape: shape,
      size: size
    }, /*#__PURE__*/React.createElement("div", {
      className: cls,
      style: style
    }, childrenShow));
  }
  return /*#__PURE__*/React.createElement(AvatarContextProvider, {
    shape: shape,
    size: size
  }, /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: style
  }, childrenWithProps));
};
var _default = exports.default = AvatarGroup;