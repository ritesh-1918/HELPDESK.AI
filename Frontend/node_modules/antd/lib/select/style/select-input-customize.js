"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const genSelectInputCustomizeStyle = token => {
  const {
    componentCls
  } = token;
  return {
    [`&${componentCls}-customize`]: {
      border: 0,
      padding: 0,
      fontSize: 'inherit',
      lineHeight: 'inherit',
      [`${componentCls}-placeholder`]: {
        display: 'none'
      },
      [`${componentCls}-content`]: {
        margin: 0,
        padding: 0,
        '&-value': {
          display: 'none'
        }
      }
    }
  };
};
var _default = exports.default = genSelectInputCustomizeStyle;