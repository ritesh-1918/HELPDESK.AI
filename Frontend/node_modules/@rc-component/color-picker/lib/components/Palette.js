"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Palette = ({
  children,
  style,
  prefixCls
}) => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: `${prefixCls}-palette`,
    style: {
      position: 'relative',
      ...style
    }
  }, children);
};
var _default = exports.default = Palette;