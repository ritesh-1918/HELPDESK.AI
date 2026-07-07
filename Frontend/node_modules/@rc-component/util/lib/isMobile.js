"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isMobile = _interopRequireDefault(require("is-mobile"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
let cached;
var _default = () => {
  if (typeof cached === 'undefined') {
    cached = (0, _isMobile.default)();
  }
  return cached;
};
exports.default = _default;