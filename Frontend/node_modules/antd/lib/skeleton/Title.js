"use strict";
"use client";

/* eslint-disable jsx-a11y/heading-has-content */
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
const Title = ({
  prefixCls,
  className,
  width,
  style
}) => (
/*#__PURE__*/
// biome-ignore lint/a11y/useHeadingContent: HOC here
React.createElement("h3", {
  className: (0, _clsx.clsx)(prefixCls, className),
  style: {
    width,
    ...style
  }
}));
var _default = exports.default = Title;