"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Base = _interopRequireDefault(require("./Base"));
const Paragraph = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    children,
    ...restProps
  } = props;
  return /*#__PURE__*/React.createElement(_Base.default, {
    ref: ref,
    ...restProps,
    component: "div"
  }, children);
});
var _default = exports.default = Paragraph;