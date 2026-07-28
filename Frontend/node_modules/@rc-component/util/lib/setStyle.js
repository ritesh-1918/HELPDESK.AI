"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Easy to set element style, return previous style
 * IE browser compatible(IE browser doesn't merge overflow style, need to set it separately)
 * https://github.com/ant-design/ant-design/issues/19393
 *
 */
function setStyle(style, options = {}) {
  if (!style) {
    return {};
  }
  const {
    element = document.body
  } = options;
  const oldStyle = {};
  const styleKeys = Object.keys(style);

  // IE browser compatible
  styleKeys.forEach(key => {
    oldStyle[key] = element.style[key];
  });
  styleKeys.forEach(key => {
    element.style[key] = style[key];
  });
  return oldStyle;
}
var _default = exports.default = setStyle;