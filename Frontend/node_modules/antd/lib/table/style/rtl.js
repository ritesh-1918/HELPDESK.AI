"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fixed = require("./fixed");
const genStyle = token => {
  const {
    componentCls
  } = token;
  const [leftShadowStyle, rightShadowStyle] = (0, _fixed.getShadowStyle)(token);
  return {
    [`${componentCls}-wrapper-rtl`]: {
      direction: 'rtl',
      table: {
        direction: 'rtl'
      },
      [`${componentCls}-row-expand-icon`]: {
        float: 'right',
        '&::after': {
          transform: 'rotate(-90deg)'
        },
        '&-collapsed::before': {
          transform: 'rotate(180deg)'
        },
        '&-collapsed::after': {
          transform: 'rotate(0deg)'
        }
      },
      // ====================== Cell ======================
      [`${componentCls}-cell-fix`]: {
        '&-start-shadow-show:after': rightShadowStyle,
        '&-end-shadow-show:after': leftShadowStyle
      },
      // =================== Container ====================
      [`${componentCls}-container`]: {
        [`${componentCls}-row-indent`]: {
          float: 'right'
        }
      },
      [`${componentCls}-fix-start-shadow-show ${componentCls}-container:before`]: rightShadowStyle,
      [`${componentCls}-fix-end-shadow-show ${componentCls}-container:after`]: leftShadowStyle
    }
  };
};
var _default = exports.default = genStyle;