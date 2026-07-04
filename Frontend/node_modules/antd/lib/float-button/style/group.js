"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _style = require("../../style");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
const genGroupStyle = token => {
  const {
    componentCls,
    antCls,
    floatButtonSize,
    padding
  } = token;
  const groupCls = `${componentCls}-group`;
  const listCls = `${groupCls}-list`;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'float-btn');
  return {
    [groupCls]: [
    // ==============================================================
    // ==                         Variable                         ==
    // ==============================================================
    {
      [varName('list-transform-start')]: `translate(0,${(0, _cssinjs.unit)(floatButtonSize)})`,
      [varName('list-trigger-offset')]: `calc(${(0, _cssinjs.unit)(floatButtonSize)} + ${(0, _cssinjs.unit)(padding)})`
    },
    // ==============================================================
    // ==                         Template                         ==
    // ==============================================================
    {
      ...(0, _style.resetComponent)(token),
      position: 'fixed',
      zIndex: token.zIndexPopupBase,
      insetInlineEnd: token.floatButtonInsetInlineEnd,
      bottom: token.floatButtonInsetBlockEnd,
      gap: padding,
      '&-rtl': {
        direction: 'rtl'
      },
      // =========================== Pure ===========================
      [`&${componentCls}-pure`]: {
        position: 'relative',
        inset: 'auto'
      },
      // ========================== Button ==========================
      [componentCls]: {
        position: 'relative',
        inset: 'auto'
      }
    },
    // ==============================================================
    // ==                           List                           ==
    // ==============================================================
    {
      // ======================== Individual ========================
      // Not in group
      [`&:not(${groupCls}-individual) ${listCls}`]: {
        boxShadow: token.boxShadowSecondary
      },
      [`&${groupCls}-individual ${listCls}`]: {
        gap: padding
      },
      // =========================== Menu ===========================
      [`&-menu-mode ${listCls}`]: {
        position: 'absolute'
      },
      // ========================== Motion ==========================
      [listCls]: {
        borderRadius: token.borderRadiusLG,
        '&-motion': {
          transition: `all ${token.motionDurationSlow}`,
          '&-enter, &-appear': {
            opacity: 0,
            transform: varRef('list-transform-start'),
            '&-active': {
              opacity: 1,
              transform: `translate(0, 0)`
            }
          },
          '&-leave': {
            '&-active': {
              opacity: 0,
              transform: varRef('list-transform-start')
            }
          }
        }
      },
      // ======================== Placements ========================
      '&-top': {
        [listCls]: {
          bottom: varRef('list-trigger-offset')
        }
      },
      '&-bottom': {
        [listCls]: {
          [varName('list-transform-start')]: `translate(0, calc(${(0, _cssinjs.unit)(floatButtonSize)} * -1))`,
          top: varRef('list-trigger-offset')
        }
      },
      '&-left': {
        [listCls]: {
          [varName('list-transform-start')]: `translate(${(0, _cssinjs.unit)(floatButtonSize)}, 0)`,
          right: varRef('list-trigger-offset')
        }
      },
      '&-right': {
        [listCls]: {
          [varName('list-transform-start')]: `translate(calc(${(0, _cssinjs.unit)(floatButtonSize)} * -1), 0)`,
          left: varRef('list-trigger-offset')
        }
      }
    }]
  };
};
var _default = exports.default = genGroupStyle;