"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClearIcon = getClearIcon;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function getClearIcon(prefixCls, allowClear, clearIcon) {
  var mergedClearIcon = _typeof(allowClear) === "object" ? allowClear.clearIcon : clearIcon;
  return mergedClearIcon || /*#__PURE__*/_react.default.createElement("span", {
    className: "".concat(prefixCls, "-clear-btn")
  });
}