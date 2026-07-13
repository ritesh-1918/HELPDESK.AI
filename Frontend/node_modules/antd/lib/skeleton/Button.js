"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _configProvider = require("../config-provider");
var _Element = _interopRequireDefault(require("./Element"));
var _style = _interopRequireDefault(require("./style"));
const SkeletonButton = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    classNames,
    active,
    style,
    styles,
    block = false,
    size = 'default',
    ...rest
  } = props;
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const cls = (0, _clsx.clsx)(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-block`]: block
  }, classNames?.root, className, rootClassName, hashId, cssVarCls);
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    style: styles?.root
  }, /*#__PURE__*/React.createElement(_Element.default, {
    prefixCls: `${prefixCls}-button`,
    className: classNames?.content,
    style: {
      ...styles?.content,
      ...style
    },
    size: size,
    ...rest
  }));
};
var _default = exports.default = SkeletonButton;