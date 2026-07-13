"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = element => {
  if (!element) {
    return false;
  }
  if (element instanceof Element) {
    if (element.offsetParent) {
      return true;
    }
    if (element.getBBox) {
      const {
        width,
        height
      } = element.getBBox();
      if (width || height) {
        return true;
      }
    }
    if (element.getBoundingClientRect) {
      const {
        width,
        height
      } = element.getBoundingClientRect();
      if (width || height) {
        return true;
      }
    }
  }
  return false;
};
exports.default = _default;