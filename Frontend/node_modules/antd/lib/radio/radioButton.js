"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _configProvider = require("../config-provider");
var _context = require("./context");
var _radio = _interopRequireDefault(require("./radio"));
const RadioButton = (props, ref) => {
  const {
    getPrefixCls
  } = React.useContext(_configProvider.ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    ...radioProps
  } = props;
  const prefixCls = getPrefixCls('radio', customizePrefixCls);
  return /*#__PURE__*/React.createElement(_context.RadioOptionTypeContextProvider, {
    value: "button"
  }, /*#__PURE__*/React.createElement(_radio.default, {
    prefixCls: prefixCls,
    ...radioProps,
    type: "radio",
    ref: ref
  }));
};
var _default = exports.default = /*#__PURE__*/React.forwardRef(RadioButton);