"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _unitless = _interopRequireDefault(require("@emotion/unitless"));
/**
 * respect https://github.com/cuth/postcss-pxtorem
 */
// @ts-ignore

const pxRegex = /url\([^)]+\)|var\([^)]+\)|(\d*\.?\d+)px/g;
function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
}
const transform = (options = {}) => {
  const {
    rootValue = 16,
    precision = 5,
    mediaQuery = false
  } = options;
  const pxReplace = (m, $1) => {
    if (!$1) return m;
    const pixels = parseFloat($1);
    // covenant: pixels <= 1, not transform to rem @zombieJ
    if (pixels <= 1) return m;
    const fixedVal = toFixed(pixels / rootValue, precision);
    return `${fixedVal}rem`;
  };
  const visit = cssObj => {
    const clone = {
      ...cssObj
    };
    Object.entries(cssObj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('px')) {
        const newValue = value.replace(pxRegex, pxReplace);
        clone[key] = newValue;
      }

      // no unit
      if (!_unitless.default[key] && typeof value === 'number' && value !== 0) {
        clone[key] = `${value}px`.replace(pxRegex, pxReplace);
      }

      // Media queries
      const mergedKey = key.trim();
      if (mergedKey.startsWith('@') && mergedKey.includes('px') && mediaQuery) {
        const newKey = key.replace(pxRegex, pxReplace);
        clone[newKey] = clone[key];
        delete clone[key];
      }
    });
    return clone;
  };
  return {
    visit
  };
};
var _default = exports.default = transform;