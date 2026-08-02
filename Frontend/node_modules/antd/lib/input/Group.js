"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _clsx = require("clsx");
var _warning = require("../_util/warning");
var _configProvider = require("../config-provider");
var _context = require("../form/context");
var _space = _interopRequireDefault(require("../space"));
var _style = _interopRequireDefault(require("./style"));
/** @deprecated Please use `Space.Compact` */
const Group = props => {
  const {
    getPrefixCls,
    direction
  } = (0, _react.useContext)(_configProvider.ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className
  } = props;
  const prefixCls = getPrefixCls('input-group', customizePrefixCls);
  const inputPrefixCls = getPrefixCls('input');
  const [hashId, cssVarCls] = (0, _style.default)(inputPrefixCls);
  const cls = (0, _clsx.clsx)(prefixCls, cssVarCls, {
    [`${prefixCls}-lg`]: props.size === 'large',
    [`${prefixCls}-sm`]: props.size === 'small',
    [`${prefixCls}-compact`]: props.compact,
    [`${prefixCls}-rtl`]: direction === 'rtl'
  }, hashId, className);
  const formItemContext = (0, _react.useContext)(_context.FormItemInputContext);
  const groupFormItemContext = (0, _react.useMemo)(() => ({
    ...formItemContext,
    isFormItemInput: false
  }), [formItemContext]);
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Input.Group');
    warning.deprecated(false, 'Input.Group', 'Space.Compact');
  }
  return /*#__PURE__*/React.createElement(_context.FormItemInputContext.Provider, {
    value: groupFormItemContext
  }, /*#__PURE__*/React.createElement(_space.default.Compact, {
    className: cls,
    style: props.style,
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    onFocus: props.onFocus,
    onBlur: props.onBlur
  }, props.children));
};
var _default = exports.default = Group;