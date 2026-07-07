"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
const genRTLStyle = token => {
  const {
    componentCls,
    lineWidthBold,
    antCls
  } = token;
  const itemCls = `${componentCls}-item`;
  const [, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'cmp-steps');
  return {
    [`${componentCls}${componentCls}-rtl`]: {
      direction: 'rtl',
      // nav
      [`&${componentCls}-navigation${componentCls}-horizontal`]: {
        [`${itemCls}:after`]: {
          transform: 'translateY(-50%) rotate(-45deg)'
        }
      },
      // panel
      [`&${componentCls}-panel`]: {
        [`${componentCls}-panel-arrow`]: {
          transform: `scaleX(-1)`
        },
        [`&${componentCls}-filled`]: {
          [itemCls]: {
            '&:not(:first-child)': {
              clipPath: `polygon(${[`calc(0px - ${varRef('item-base-width')}) 0px`, `calc(100% - ${(0, _cssinjs.unit)(lineWidthBold)}) 0px`, `calc(100% - ${varRef('item-base-width')} - ${(0, _cssinjs.unit)(lineWidthBold)}) 50%`, `calc(100% - ${(0, _cssinjs.unit)(lineWidthBold)}) 100%`, `calc(0px - ${varRef('item-base-width')}) 100%`].join(',')})`
            }
          }
        }
      }
    }
  };
};
var _default = exports.default = genRTLStyle;