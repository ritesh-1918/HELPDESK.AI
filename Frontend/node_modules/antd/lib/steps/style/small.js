"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _genStyleUtils = require("../../theme/util/genStyleUtils");
var _util = require("./util");
const genSmallStyle = token => {
  const {
    componentCls,
    iconSizeSM,
    fontSize,
    lineHeight,
    marginXS,
    fontHeight,
    marginSM,
    paddingXS,
    antCls
  } = token;
  const [varName] = (0, _genStyleUtils.genCssVar)(antCls, 'cmp-steps');
  return {
    [`${componentCls}${componentCls}-small`]: {
      [varName('icon-size')]: iconSizeSM,
      [varName('title-horizontal-item-margin')]: marginSM,
      [varName('title-vertical-row-gap')]: paddingXS,
      [varName('title-font-size')]: fontSize,
      [varName('title-line-height')]: lineHeight,
      [varName('title-horizontal-rail-margin')]: marginXS,
      [varName('title-horizontal-title-height')]: fontHeight,
      // Horizontal: label vertical
      [`&${componentCls}-horizontal${componentCls}-title-vertical`]: (0, _util.getItemWithWidthStyle)(token, marginXS)
    }
  };
};
var _default = exports.default = genSmallStyle;