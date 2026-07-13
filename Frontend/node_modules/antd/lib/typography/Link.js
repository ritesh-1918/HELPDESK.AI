"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _warning = require("../_util/warning");
var _Base = _interopRequireDefault(require("./Base"));
const Link = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    ellipsis,
    rel,
    children,
    // @ts-expect-error: https://github.com/ant-design/ant-design/issues/26622
    navigate: _navigate,
    ...restProps
  } = props;
  if (process.env.NODE_ENV !== 'production') {
    const warning = (0, _warning.devUseWarning)('Typography.Link');
    process.env.NODE_ENV !== "production" ? warning(typeof ellipsis !== 'object', 'usage', '`ellipsis` only supports boolean value.') : void 0;
  }
  const mergedProps = {
    ...restProps,
    rel: rel === undefined && restProps.target === '_blank' ? 'noopener noreferrer' : rel
  };
  return /*#__PURE__*/React.createElement(_Base.default, {
    ...mergedProps,
    ref: ref,
    ellipsis: !!ellipsis,
    component: "a"
  }, children);
});
var _default = exports.default = Link;