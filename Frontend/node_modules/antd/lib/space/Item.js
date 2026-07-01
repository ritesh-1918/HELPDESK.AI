"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = require("clsx");
var _isNonNullable = _interopRequireDefault(require("../_util/isNonNullable"));
var _context = require("./context");
const Item = props => {
  const {
    className,
    prefix,
    index,
    children,
    separator,
    style,
    classNames,
    styles
  } = props;
  const {
    latestIndex
  } = React.useContext(_context.SpaceContext);
  if (!(0, _isNonNullable.default)(children)) {
    return null;
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, children), index < latestIndex && separator && (/*#__PURE__*/React.createElement("span", {
    className: (0, _clsx.clsx)(`${prefix}-item-separator`, classNames?.separator),
    style: styles?.separator
  }, separator)));
};
var _default = exports.default = Item;