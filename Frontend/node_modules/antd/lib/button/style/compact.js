"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compactItem = require("../../style/compact-item");
var _compactItemVertical = require("../../style/compact-item-vertical");
var _internal = require("../../theme/internal");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
var _token = require("./token");
const genButtonCompactStyle = token => {
  const {
    antCls,
    componentCls,
    lineWidth,
    calc,
    colorBgContainer
  } = token;
  const solidSelector = `${componentCls}-variant-solid:not([disabled])`;
  const insetOffset = calc(lineWidth).mul(-1).equal();
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'btn');
  const getCompactBorderStyle = vertical => {
    const itemCls = `${componentCls}-compact${vertical ? '-vertical' : ''}-item`;
    return {
      // TODO: Border color transition should be not cover when has color.
      [itemCls]: {
        [varName('compact-connect-border-color')]: varRef('bg-color-hover'),
        [`&${solidSelector}`]: {
          transition: `none`,
          [`& + ${solidSelector}:before`]: [{
            position: 'absolute',
            backgroundColor: varRef('compact-connect-border-color'),
            content: '""'
          }, vertical ? {
            top: insetOffset,
            insetInline: insetOffset,
            height: lineWidth
          } : {
            insetBlock: insetOffset,
            insetInlineStart: insetOffset,
            width: lineWidth
          }],
          '&:hover:before': {
            display: 'none'
          }
        }
      }
    };
  };
  // Special styles for solid Button
  return [getCompactBorderStyle(), getCompactBorderStyle(true), {
    [`${solidSelector}${componentCls}-color-default`]: {
      [varName('compact-connect-border-color')]: `color-mix(in srgb, ${varRef('bg-color-hover')} 75%, ${colorBgContainer})`
    }
  }];
};
// ============================== Export ==============================
var _default = exports.default = (0, _internal.genSubStyleComponent)(['Button', 'compact'], token => {
  const buttonToken = (0, _token.prepareToken)(token);
  return [
  // Space Compact
  (0, _compactItem.genCompactItemStyle)(buttonToken), (0, _compactItemVertical.genCompactItemVerticalStyle)(buttonToken), genButtonCompactStyle(buttonToken)];
}, _token.prepareComponentToken);