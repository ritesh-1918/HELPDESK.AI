"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = options => {
  const {
    id,
    percent,
    strokeLinecap,
    strokeWidth,
    loading
  } = options;
  if (!loading) {
    return {
      indeterminateStyleProps: {},
      indeterminateStyleAnimation: null
    };
  }
  const animationName = `${id}-indeterminate-animate`;
  const strokeDashOffset = 100 - (percent + (strokeLinecap === 'round' ? strokeWidth : 0));
  return {
    indeterminateStyleProps: {
      strokeDasharray: `${percent} 100`,
      animation: `${animationName} .6s linear alternate infinite`,
      strokeDashoffset: 0
    },
    indeterminateStyleAnimation: /*#__PURE__*/_react.default.createElement("style", null, `@keyframes ${animationName} {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -${strokeDashOffset};
          }`)
  };
};
exports.default = _default;