"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = require("clsx");
var _statusUtils = require("../_util/statusUtils");
var _configProvider = require("../config-provider");
var _Compact = require("./Compact");
var _addon = _interopRequireDefault(require("./style/addon"));
const SpaceAddon = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    className,
    children,
    style,
    prefixCls: customizePrefixCls,
    variant = 'outlined',
    disabled,
    status,
    ...restProps
  } = props;
  const {
    getPrefixCls,
    direction: directionConfig
  } = _react.default.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('space-addon', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _addon.default)(prefixCls);
  const {
    compactItemClassnames,
    compactSize
  } = (0, _Compact.useCompactItemContext)(prefixCls, directionConfig);
  const statusCls = (0, _statusUtils.getStatusClassNames)(prefixCls, status);
  const classes = (0, _clsx.clsx)(prefixCls, hashId, compactItemClassnames, cssVarCls, `${prefixCls}-variant-${variant}`, statusCls, {
    [`${prefixCls}-${compactSize}`]: compactSize,
    [`${prefixCls}-disabled`]: disabled
  }, className);
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: ref,
    className: classes,
    style: style,
    ...restProps
  }, children);
});
var _default = exports.default = SpaceAddon;