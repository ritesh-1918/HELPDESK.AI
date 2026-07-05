"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const ColorBlock = ({
  color,
  prefixCls,
  className,
  style,
  innerClassName,
  innerStyle,
  onClick
}) => {
  const colorBlockCls = `${prefixCls}-color-block`;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(colorBlockCls, className),
    style: style,
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${colorBlockCls}-inner`, innerClassName),
    style: {
      background: color,
      ...innerStyle
    }
  }));
};
var _default = exports.default = ColorBlock;