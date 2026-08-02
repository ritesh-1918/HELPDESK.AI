"use strict";
"use client";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
const PanelArrow = props => {
  const {
    prefixCls
  } = props;
  return /*#__PURE__*/React.createElement("svg", {
    className: `${prefixCls}-panel-arrow`,
    viewBox: "0 0 100 100",
    xmlns: "http://www.w3.org/2000/svg",
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("title", null, "Arrow"), /*#__PURE__*/React.createElement("path", {
    d: "M 0 0 L 100 50 L 0 100"
  }));
};
var _default = exports.default = PanelArrow;