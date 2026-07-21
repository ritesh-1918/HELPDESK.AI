"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _genStyleUtils = require("../../theme/util/genStyleUtils");
const genHorizontalStyle = token => {
  const {
    componentCls,
    antCls
  } = token;
  const itemCls = `${componentCls}-item`;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'cmp-steps');
  return {
    [`${componentCls}-horizontal`]: {
      [`> ${itemCls}`]: {
        flex: '1 1 auto',
        minWidth: token.iconSize,
        [`${itemCls}-rail`]: {
          [varName('horizontal-rail-margin')]: `calc(${varRef('icon-size-max')} / 2 + ${varRef('item-wrapper-padding-top')})`,
          position: 'static',
          marginTop: varRef('horizontal-rail-margin'),
          width: 'auto',
          borderBlockStartWidth: varRef('rail-size'),
          flex: 1,
          minWidth: 0,
          alignSelf: 'flex-start',
          transform: 'translateY(-50%)'
        }
      }
    }
  };
};
var _default = exports.default = genHorizontalStyle;