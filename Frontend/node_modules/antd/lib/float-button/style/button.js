"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
const genFloatButtonStyle = token => {
  const {
    componentCls,
    floatButtonSize,
    iconCls,
    antCls,
    floatButtonIconSize
  } = token;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'float-btn');
  const badgeCls = `${componentCls}-badge`;
  const R = Math.SQRT2;
  const offsetR = (R - 1) / R;
  const offsetSquare = token.calc(token.borderRadius).mul(offsetR).equal();
  const offsetCircle = token.calc(token.controlHeight).div(2).mul(offsetR).equal();
  return {
    [componentCls]: [
    // ==============================================================
    // ==                         Variable                         ==
    // ==============================================================
    {
      [varName('size')]: (0, _cssinjs.unit)(floatButtonSize)
    },
    // ==============================================================
    // ==                         Template                         ==
    // ==============================================================
    {
      flexDirection: 'column',
      margin: 0,
      padding: `${(0, _cssinjs.unit)(token.paddingXXS)} 0`,
      width: varRef('size'),
      minHeight: varRef('size'),
      height: 'auto',
      wordBreak: 'break-word',
      whiteSpace: 'normal',
      gap: token.calc(token.paddingXXS).div(2).equal(),
      '&-rtl': {
        direction: 'rtl'
      },
      // ======================== Individual ========================
      // Not in group
      [`&${componentCls}-individual`]: {
        position: 'fixed',
        zIndex: token.zIndexPopupBase,
        insetInlineEnd: token.floatButtonInsetInlineEnd,
        bottom: token.floatButtonInsetBlockEnd,
        boxShadow: token.boxShadowSecondary
      },
      // =========================== Pure ===========================
      [`&${componentCls}-pure`]: {
        position: 'relative',
        inset: 'auto'
      },
      // ========================== Empty ===========================
      '&:empty': {
        display: 'none'
      },
      // =========================== Icon ===========================
      [`${componentCls}-icon`]: {
        lineHeight: 1
      },
      // Icon Only will has large icon Size
      [`&${componentCls}-icon-only`]: {
        [iconCls]: {
          fontSize: floatButtonIconSize
        }
      },
      // =========================== Desc ===========================
      [`${componentCls}-content`]: {
        fontSize: token.fontSizeSM
      },
      // ========================== Badge ===========================
      [badgeCls]: {
        position: 'absolute',
        top: 0,
        insetInlineEnd: 0,
        [`&:not(${badgeCls}-dot)`]: {
          transform: 'translate(50%, -50%)'
        }
      },
      // RTL
      [`&-rtl ${badgeCls}:not(${badgeCls}-dot)`]: {
        transform: 'translate(-50%, -50%)'
      },
      // Shape: square
      '&-square': {
        [`${badgeCls}-dot`]: {
          marginTop: offsetSquare,
          marginInlineEnd: offsetSquare
        }
      },
      // Shape: circle
      '&-circle': {
        [badgeCls]: {
          marginTop: offsetCircle,
          marginInlineEnd: offsetCircle
        }
      }
    }]
  };
};
var _default = exports.default = genFloatButtonStyle;