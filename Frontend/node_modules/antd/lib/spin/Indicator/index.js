"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Indicator;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _reactNode = require("../../_util/reactNode");
var _Looper = _interopRequireDefault(require("./Looper"));
function Indicator(props) {
  const {
    prefixCls,
    indicator,
    percent,
    className,
    style
  } = props;
  const dotClassName = `${prefixCls}-dot`;
  if (indicator && /*#__PURE__*/React.isValidElement(indicator)) {
    return (0, _reactNode.cloneElement)(indicator, currentProps => ({
      className: (0, _clsx.clsx)(currentProps.className, dotClassName, className),
      style: {
        ...currentProps.style,
        ...style
      },
      percent
    }));
  }
  return /*#__PURE__*/React.createElement(_Looper.default, {
    prefixCls: prefixCls,
    percent: percent,
    className: className,
    style: style
  });
}