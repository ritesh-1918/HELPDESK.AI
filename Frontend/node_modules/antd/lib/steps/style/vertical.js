"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _genStyleUtils = require("../../theme/util/genStyleUtils");
const genVerticalStyle = token => {
  const {
    componentCls,
    marginXXS,
    paddingSM,
    controlHeight,
    antCls,
    calc
  } = token;
  const itemCls = `${componentCls}-item`;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'cmp-steps');
  return {
    [`${componentCls}-vertical`]: {
      [varName('vertical-rail-margin')]: calc(marginXXS).mul(1.5).equal(),
      flexDirection: 'column',
      alignItems: 'stretch',
      // Item
      [`> ${itemCls}`]: {
        minHeight: calc(controlHeight).mul(1.5).equal(),
        paddingBottom: paddingSM,
        '&:last-child': {
          paddingBottom: 0
        },
        // Icon
        [`${itemCls}-icon`]: {
          marginInlineStart: `calc((${varRef('icon-size-max')} - ${varRef('icon-size')}) / 2)`
        },
        // >>> Rail
        [`${itemCls}-rail`]: {
          [varName('rail-offset')]: calc(varRef('heading-height')).sub(varRef('icon-size')).div(2).equal(),
          borderInlineStartWidth: varRef('rail-size'),
          position: 'absolute',
          top: calc(varRef('icon-size')).add(varRef('item-wrapper-padding-top')).add(varRef('rail-offset')).add(varRef('vertical-rail-margin')).equal(),
          insetInlineStart: calc(varRef('icon-size-max')).div(2).equal(),
          bottom: calc(varRef('vertical-rail-margin')).sub(varRef('rail-offset')).equal(),
          marginInlineStart: `calc(${varRef('rail-size')} / -2)`
        }
      }
    }
  };
};
var _default = exports.default = genVerticalStyle;