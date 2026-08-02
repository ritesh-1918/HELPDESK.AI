"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _util = require("@rc-component/util");
var _clsx = require("clsx");
var _gapSize = require("../_util/gapSize");
var _hooks = require("../_util/hooks");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _configProvider = require("../config-provider");
var _style = _interopRequireDefault(require("./style"));
var _utils = _interopRequireDefault(require("./utils"));
const Flex = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    rootClassName,
    className,
    style,
    flex,
    gap,
    vertical,
    orientation,
    component: Component = 'div',
    children,
    ...othersProps
  } = props;
  const {
    flex: ctxFlex,
    direction: ctxDirection,
    getPrefixCls
  } = _react.default.useContext(_configProvider.ConfigContext);
  const prefixCls = getPrefixCls('flex', customizePrefixCls);
  const [hashId, cssVarCls] = (0, _style.default)(prefixCls);
  const [, mergedVertical] = (0, _hooks.useOrientation)(orientation, vertical ?? ctxFlex?.vertical);
  const mergedCls = (0, _clsx.clsx)(className, rootClassName, ctxFlex?.className, prefixCls, hashId, cssVarCls, (0, _utils.default)(prefixCls, {
    ...props,
    vertical: mergedVertical
  }), {
    [`${prefixCls}-rtl`]: ctxDirection === 'rtl',
    [`${prefixCls}-gap-${gap}`]: (0, _gapSize.isPresetSize)(gap),
    [`${prefixCls}-vertical`]: mergedVertical
  });
  const mergedStyle = {
    ...ctxFlex?.style,
    ...style
  };
  if ((0, _isNonNullable.default)(flex)) {
    mergedStyle.flex = flex;
  }
  if ((0, _isNonNullable.default)(gap) && !(0, _gapSize.isPresetSize)(gap)) {
    mergedStyle.gap = gap;
  }
  return /*#__PURE__*/_react.default.createElement(Component, {
    ref: ref,
    className: mergedCls,
    style: mergedStyle,
    ...(0, _util.omit)(othersProps, ['justify', 'wrap', 'align'])
  }, children);
});
if (process.env.NODE_ENV !== 'production') {
  Flex.displayName = 'Flex';
}
var _default = exports.default = Flex;