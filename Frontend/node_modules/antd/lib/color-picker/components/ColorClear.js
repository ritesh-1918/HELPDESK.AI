"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _util = require("../util");
const ColorClear = ({
  prefixCls,
  value,
  onChange,
  className,
  style
}) => {
  const onClick = () => {
    if (onChange && value && !value.cleared) {
      const hsba = value.toHsb();
      hsba.a = 0;
      const genColor = (0, _util.generateColor)(hsba);
      genColor.cleared = true;
      onChange(genColor);
    }
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.default)(`${prefixCls}-clear`, className),
    style: style,
    onClick: onClick
  });
};
var _default = exports.default = ColorClear;