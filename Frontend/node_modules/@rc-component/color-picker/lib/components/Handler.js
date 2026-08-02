"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _clsx = require("clsx");
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Handler = ({
  size = 'default',
  color,
  prefixCls
}) => {
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.clsx)(`${prefixCls}-handler`, {
      [`${prefixCls}-handler-sm`]: size === 'small'
    }),
    style: {
      backgroundColor: color
    }
  });
};
var _default = exports.default = Handler;