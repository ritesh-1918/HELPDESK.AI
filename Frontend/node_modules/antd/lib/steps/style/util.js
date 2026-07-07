"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getItemWithWidthStyle = void 0;
var _genStyleUtils = require("../../theme/util/genStyleUtils");
function withoutVar(cssVar) {
  return (cssVar || '--ant-not-exist').replace(/var\((.*)\)/, '$1');
}
/**
 * Force override the width related styles.
 * This should be multiple since will conflict with other `rail` styles.
 */
const getItemWithWidthStyle = (token, marginSize, optionalStyle) => {
  const {
    calc,
    componentCls,
    descriptionMaxWidth,
    antCls
  } = token;
  const itemCls = `${componentCls}-item`;
  const [, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'cmp-steps');
  return {
    [`@container style(${withoutVar(descriptionMaxWidth)})`]: [{
      // Icon
      [`${itemCls}-icon`]: {
        marginInlineStart: calc(descriptionMaxWidth).sub(varRef('icon-size')).div(2).equal()
      },
      // >>> Rail
      [`${itemCls}-rail`]: {
        width: 'auto',
        insetInlineStart: calc(descriptionMaxWidth).add(varRef('icon-size')).div(2).add(marginSize).equal(),
        insetInlineEnd: calc(descriptionMaxWidth).sub(varRef('icon-size')).div(2).sub(marginSize).mul(-1).equal()
      }
    }, optionalStyle]
  };
};
exports.getItemWithWidthStyle = getItemWithWidthStyle;