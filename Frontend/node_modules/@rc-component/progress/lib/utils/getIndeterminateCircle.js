"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = ({
  id,
  loading
}) => {
  if (!loading) {
    return {
      indeterminateStyleProps: {},
      indeterminateStyleAnimation: null
    };
  }
  const animationName = `${id}-indeterminate-animate`;
  return {
    indeterminateStyleProps: {
      transform: 'rotate(0deg)',
      animation: `${animationName} 1s linear infinite`
    },
    indeterminateStyleAnimation: /*#__PURE__*/_react.default.createElement("style", null, `@keyframes ${animationName} {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`)
  };
};
exports.default = _default;