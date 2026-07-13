"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _style = require("../../input/style");
var _variants = require("../../input/style/variants");
var _style2 = require("../../style");
var _compactItem = require("../../style/compact-item");
var _internal = require("../../theme/internal");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
var _token = require("./token");
const genInputNumberStyles = token => {
  const {
    componentCls,
    lineWidth,
    lineType,
    borderRadius,
    inputFontSizeSM,
    inputFontSizeLG,
    colorError,
    paddingInlineSM,
    paddingBlockSM,
    paddingBlockLG,
    paddingInlineLG,
    colorIcon,
    motionDurationMid,
    handleHoverColor,
    handleOpacity,
    paddingInline,
    paddingBlock,
    handleBg,
    handleActiveBg,
    inputAffixPadding,
    borderRadiusSM,
    controlWidth,
    handleBorderColor,
    filledHandleBg,
    lineHeightLG,
    antCls
  } = token;
  const borderStyle = `${(0, _cssinjs.unit)(lineWidth)} ${lineType} ${handleBorderColor}`;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'input-number');
  return [
  // ==========================================================
  // ==                         Base                         ==
  // ==========================================================
  {
    [componentCls]: {
      ...(0, _style2.resetComponent)(token),
      ...(0, _style.genBasicInputStyle)(token),
      [varName('input-padding-block')]: (0, _cssinjs.unit)(paddingBlock),
      [varName('input-padding-inline')]: (0, _cssinjs.unit)(paddingInline),
      display: 'inline-flex',
      width: controlWidth,
      margin: 0,
      paddingBlock: 0,
      borderRadius,
      // ======================= Variants =======================
      ...(0, _variants.genOutlinedStyle)(token, {
        [`${componentCls}-actions`]: {
          background: handleBg,
          [`${componentCls}-action-down`]: {
            borderBlockStart: borderStyle
          }
        }
      }),
      ...(0, _variants.genFilledStyle)(token, {
        [`${componentCls}-actions`]: {
          background: filledHandleBg,
          [`${componentCls}-action-down`]: {
            borderBlockStart: borderStyle
          }
        },
        '&:focus-within': {
          [`${componentCls}-actions`]: {
            background: handleBg
          }
        }
      }),
      ...(0, _variants.genUnderlinedStyle)(token, {
        [`${componentCls}-actions`]: {
          background: handleBg,
          [`${componentCls}-action-down`]: {
            borderBlockStart: borderStyle
          }
        }
      }),
      ...(0, _variants.genBorderlessStyle)(token),
      // ========================= RTL ==========================
      '&-rtl': {
        direction: 'rtl',
        [`${componentCls}-input`]: {
          direction: 'rtl'
        }
      },
      // ===================== Out Of Range =====================
      [`&${componentCls}-out-of-range`]: {
        [`${componentCls}-input`]: {
          color: colorError
        }
      },
      // ======================== Input =========================
      [`${componentCls}-input`]: {
        ...(0, _style2.resetComponent)(token),
        width: '100%',
        paddingBlock: varRef('input-padding-block'),
        textAlign: 'start',
        backgroundColor: 'transparent',
        border: 0,
        borderRadius,
        outline: 0,
        transition: `all ${motionDurationMid} linear`,
        appearance: 'textfield',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        ...(0, _style.genPlaceholderStyle)(token.colorTextPlaceholder),
        '&[type="number"]::-webkit-inner-spin-button, &[type="number"]::-webkit-outer-spin-button': {
          margin: 0,
          appearance: 'none'
        }
      },
      [`&:hover ${componentCls}-handler-wrap, &-focused ${componentCls}-handler-wrap`]: {
        width: token.handleWidth,
        opacity: 1
      },
      // ======================= Disabled =======================
      [`&-disabled ${componentCls}-input`]: {
        cursor: 'not-allowed',
        color: token.colorTextDisabled
      }
    }
  },
  // ==========================================================
  // ==                        Action                        ==
  // ==========================================================
  {
    [componentCls]: {
      // ======================= Shared =======================
      [`
          ${componentCls}-action-up-disabled,
          ${componentCls}-action-down-disabled
        `]: {
        cursor: 'not-allowed'
      },
      [`${componentCls}-action`]: {
        ...(0, _style2.resetIcon)(),
        userSelect: 'none',
        overflow: 'hidden',
        fontWeight: 'bold',
        lineHeight: 0,
        textAlign: 'center',
        cursor: 'pointer',
        transition: `all ${motionDurationMid} linear`,
        '&:active': {
          background: handleActiveBg
        },
        // Hover
        '&:hover': {
          color: handleHoverColor
        }
      },
      // ===================== Input Mode =====================
      '&-mode-input': {
        overflow: 'hidden',
        [`${componentCls}-actions`]: {
          position: 'absolute',
          insetBlockStart: 0,
          insetInlineEnd: 0,
          width: token.handleVisibleWidth,
          opacity: handleOpacity,
          height: '100%',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          transition: `all ${motionDurationMid}`,
          overflow: 'hidden',
          // Fix input number inside Menu makes icon too large
          // We arise the selector priority by nest selector here
          // https://github.com/ant-design/ant-design/issues/14367
          [`${componentCls}-action`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'auto',
            height: '40%',
            marginInlineEnd: 0,
            fontSize: token.handleFontSize
          }
        },
        [`&:hover ${componentCls}-actions, &-focused ${componentCls}-actions`]: {
          width: token.handleWidth,
          opacity: 1
        },
        [`${componentCls}-action`]: {
          color: colorIcon,
          height: '50%',
          borderInlineStart: borderStyle,
          // Hover
          '&:hover': {
            height: `60%`
          }
        },
        [`&${componentCls}-disabled, &${componentCls}-readonly`]: {
          [`${componentCls}-actions`]: {
            display: 'none'
          }
        }
      },
      // ==================== Spinner Mode ====================
      [`&${componentCls}-mode-spinner`]: {
        padding: 0,
        width: 'auto',
        [`${componentCls}-action`]: {
          flex: 'none',
          paddingInline: varRef('input-padding-inline'),
          '&-up': {
            borderInlineStart: borderStyle
          },
          '&-down': {
            borderInlineEnd: borderStyle
          }
        },
        [`${componentCls}-input`]: {
          textAlign: 'center',
          paddingInline: varRef('input-padding-inline')
        }
      }
    }
  },
  // ==========================================================
  // ==                         Size                         ==
  // ==========================================================
  {
    [componentCls]: {
      '&-lg': {
        [varName('input-padding-block')]: (0, _cssinjs.unit)(paddingBlockLG),
        [varName('input-padding-inline')]: (0, _cssinjs.unit)(paddingInlineLG),
        paddingBlock: 0,
        fontSize: inputFontSizeLG,
        lineHeight: lineHeightLG
      },
      '&-sm': {
        [varName('input-padding-block')]: (0, _cssinjs.unit)(paddingBlockSM),
        [varName('input-padding-inline')]: (0, _cssinjs.unit)(paddingInlineSM),
        paddingBlock: 0,
        fontSize: inputFontSizeSM,
        borderRadius: borderRadiusSM
      }
    }
  },
  // ==========================================================
  // ==                      Pre/Suffix                      ==
  // ==========================================================
  {
    [componentCls]: {
      [`${componentCls}-prefix, ${componentCls}-suffix`]: {
        display: 'flex',
        flex: 'none',
        alignItems: 'center',
        alignSelf: 'center',
        pointerEvents: 'none'
      },
      [`${componentCls}-prefix`]: {
        marginInlineEnd: inputAffixPadding
      },
      [`${componentCls}-suffix`]: {
        height: '100%',
        marginInlineStart: inputAffixPadding,
        transition: `margin ${motionDurationMid}`
      },
      [`&:hover:not(${componentCls}-without-controls)`]: {
        [`${componentCls}-suffix`]: {
          marginInlineEnd: token.handleWidth
        }
      }
    }
  }];
};
const genCompatibleStyles = token => {
  const {
    componentCls,
    antCls
  } = token;
  return {
    [`${componentCls}-addon`]: {
      [`&:has(${antCls}-select)`]: {
        border: 0,
        padding: 0
      }
    }
  };
};
var _default = exports.default = (0, _internal.genStyleHooks)('InputNumber', token => {
  const inputNumberToken = (0, _internal.mergeToken)(token, (0, _style.initInputToken)(token));
  return [genInputNumberStyles(inputNumberToken), genCompatibleStyles(inputNumberToken),
  // =====================================================
  // ==             Space Compact                       ==
  // =====================================================
  (0, _compactItem.genCompactItemStyle)(inputNumberToken)];
}, _token.prepareComponentToken, {
  unitless: {
    handleOpacity: true
  },
  resetFont: false
});