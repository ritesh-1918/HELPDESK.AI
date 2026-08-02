"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genPlaceholderStyle = exports.genInputStyle = exports.genInputSmallStyle = exports.genInputLargeStyle = exports.genInputGroupStyle = exports.genBasicInputStyle = exports.genAffixStyle = exports.genActiveStyle = exports.default = void 0;
Object.defineProperty(exports, "initComponentToken", {
  enumerable: true,
  get: function () {
    return _token.initComponentToken;
  }
});
Object.defineProperty(exports, "initInputToken", {
  enumerable: true,
  get: function () {
    return _token.initInputToken;
  }
});
exports.useSharedStyle = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _style = require("../../style");
var _compactItem = require("../../style/compact-item");
var _internal = require("../../theme/internal");
var _token = require("./token");
var _variants = require("./variants");
const genPlaceholderStyle = color => ({
  // Firefox
  '&::-moz-placeholder': {
    opacity: 1
  },
  '&::placeholder': {
    color,
    userSelect: 'none' // https://github.com/ant-design/ant-design/pull/32639
  },
  '&:placeholder-shown': {
    textOverflow: 'ellipsis'
  }
});
exports.genPlaceholderStyle = genPlaceholderStyle;
const genActiveStyle = token => ({
  borderColor: token.activeBorderColor,
  boxShadow: token.activeShadow,
  outline: 0,
  backgroundColor: token.activeBg
});
exports.genActiveStyle = genActiveStyle;
const genInputLargeStyle = token => {
  const {
    paddingBlockLG,
    lineHeightLG,
    borderRadiusLG,
    paddingInlineLG
  } = token;
  return {
    padding: `${(0, _cssinjs.unit)(paddingBlockLG)} ${(0, _cssinjs.unit)(paddingInlineLG)}`,
    fontSize: token.inputFontSizeLG,
    lineHeight: lineHeightLG,
    borderRadius: borderRadiusLG
  };
};
exports.genInputLargeStyle = genInputLargeStyle;
const genInputSmallStyle = token => ({
  padding: `${(0, _cssinjs.unit)(token.paddingBlockSM)} ${(0, _cssinjs.unit)(token.paddingInlineSM)}`,
  fontSize: token.inputFontSizeSM,
  borderRadius: token.borderRadiusSM
});
exports.genInputSmallStyle = genInputSmallStyle;
const genBasicInputStyle = (token, option = {}) => ({
  position: 'relative',
  display: 'inline-block',
  width: '100%',
  minWidth: 0,
  padding: `${(0, _cssinjs.unit)(token.paddingBlock)} ${(0, _cssinjs.unit)(token.paddingInline)}`,
  color: token.colorText,
  fontSize: token.inputFontSize,
  lineHeight: token.lineHeight,
  borderRadius: token.borderRadius,
  transition: `all ${token.motionDurationMid}`,
  ...genPlaceholderStyle(token.colorTextPlaceholder),
  // Size
  '&-lg': {
    ...genInputLargeStyle(token),
    ...option.largeStyle
  },
  '&-sm': {
    ...genInputSmallStyle(token),
    ...option.smallStyle
  },
  // RTL
  '&-rtl, &-textarea-rtl': {
    direction: 'rtl'
  }
});
exports.genBasicInputStyle = genBasicInputStyle;
const genInputGroupStyle = token => {
  const {
    componentCls,
    antCls
  } = token;
  return {
    position: 'relative',
    display: 'table',
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    // Undo padding and float of grid classes
    "&[class*='col-']": {
      paddingInlineEnd: token.paddingXS,
      '&:last-child': {
        paddingInlineEnd: 0
      }
    },
    // Sizing options
    [`&-lg ${componentCls}, &-lg > ${componentCls}-group-addon`]: {
      ...genInputLargeStyle(token)
    },
    [`&-sm ${componentCls}, &-sm > ${componentCls}-group-addon`]: {
      ...genInputSmallStyle(token)
    },
    // Fix https://github.com/ant-design/ant-design/issues/5754
    [`&-lg ${antCls}-select-single`]: {
      height: token.controlHeightLG
    },
    [`&-sm ${antCls}-select-single`]: {
      height: token.controlHeightSM
    },
    [`> ${componentCls}`]: {
      display: 'table-cell',
      '&:not(:first-child):not(:last-child)': {
        borderRadius: 0
      }
    },
    [`${componentCls}-group`]: {
      '&-addon, &-wrap': {
        display: 'table-cell',
        width: 1,
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        '&:not(:first-child):not(:last-child)': {
          borderRadius: 0
        }
      },
      '&-wrap > *': {
        display: 'block !important'
      },
      '&-addon': {
        position: 'relative',
        padding: `0 ${(0, _cssinjs.unit)(token.paddingInline)}`,
        color: token.colorText,
        fontWeight: 'normal',
        fontSize: token.inputFontSize,
        textAlign: 'center',
        borderRadius: token.borderRadius,
        transition: `all ${token.motionDurationSlow}`,
        lineHeight: 1,
        // Reset Select's style in addon
        [`${antCls}-select`]: {
          margin: `${(0, _cssinjs.unit)(token.calc(token.paddingBlock).add(1).mul(-1).equal())} ${(0, _cssinjs.unit)(token.calc(token.paddingInline).mul(-1).equal())}`,
          [`&${antCls}-select-single:not(${antCls}-select-customize-input):not(${antCls}-pagination-size-changer)`]: {
            backgroundColor: 'inherit',
            border: `${(0, _cssinjs.unit)(token.lineWidth)} ${token.lineType} transparent`,
            boxShadow: 'none'
          }
        },
        // https://github.com/ant-design/ant-design/issues/31333
        [`${antCls}-cascader-picker`]: {
          margin: `-9px ${(0, _cssinjs.unit)(token.calc(token.paddingInline).mul(-1).equal())}`,
          backgroundColor: 'transparent',
          [`${antCls}-cascader-input`]: {
            textAlign: 'start',
            border: 0,
            boxShadow: 'none'
          }
        }
      }
    },
    [componentCls]: {
      width: '100%',
      marginBottom: 0,
      textAlign: 'inherit',
      '&:focus': {
        zIndex: 1,
        // Fix https://gw.alipayobjects.com/zos/rmsportal/DHNpoqfMXSfrSnlZvhsJ.png
        borderInlineEndWidth: 1
      },
      '&:hover': {
        zIndex: 1,
        borderInlineEndWidth: 1
      }
    },
    // Reset rounded corners
    [`> ${componentCls}:first-child, ${componentCls}-group-addon:first-child`]: {
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
      // Reset Select's style in addon
      [`${antCls}-select`]: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0
      }
    },
    [`> ${componentCls}-affix-wrapper`]: {
      [`&:not(:first-child) ${componentCls}`]: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0
      },
      [`&:not(:last-child) ${componentCls}`]: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0
      }
    },
    [`> ${componentCls}:last-child, ${componentCls}-group-addon:last-child`]: {
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      // Reset Select's style in addon
      [`${antCls}-select`]: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0
      }
    },
    [`${componentCls}-affix-wrapper`]: {
      '&:not(:last-child)': {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0
      },
      '&:not(:first-child)': {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0
      }
    },
    [`&${componentCls}-group-compact`]: {
      display: 'block',
      ...(0, _style.clearFix)(),
      [`${componentCls}-group-addon, ${componentCls}-group-wrap, > ${componentCls}`]: {
        '&:not(:first-child):not(:last-child)': {
          borderInlineEndWidth: token.lineWidth,
          '&:hover, &:focus': {
            zIndex: 1
          }
        }
      },
      '& > *': {
        display: 'inline-flex',
        float: 'none',
        verticalAlign: 'top',
        // https://github.com/ant-design/ant-design-pro/issues/139
        borderRadius: 0
      },
      [`
        & > ${componentCls}-affix-wrapper,
        & > ${componentCls}-number-affix-wrapper,
        & > ${antCls}-picker-range
      `]: {
        display: 'inline-flex'
      },
      '& > *:not(:last-child)': {
        marginInlineEnd: token.calc(token.lineWidth).mul(-1).equal(),
        borderInlineEndWidth: token.lineWidth
      },
      // Undo float for .ant-input-group .ant-input
      [componentCls]: {
        float: 'none'
      },
      // reset border for Select, DatePicker, AutoComplete, Cascader, Mention, TimePicker, Input
      [`& > ${antCls}-select,
      & > ${antCls}-select-auto-complete ${componentCls},
      & > ${antCls}-cascader-picker ${componentCls},
      & > ${componentCls}-group-wrapper ${componentCls}`]: {
        borderInlineEndWidth: token.lineWidth,
        borderRadius: 0,
        '&:hover, &:focus': {
          zIndex: 1
        }
      },
      [`& > ${antCls}-select-focused`]: {
        zIndex: 1
      },
      // update z-index for arrow icon
      [`& > ${antCls}-select > ${antCls}-select-arrow`]: {
        zIndex: 1 // https://github.com/ant-design/ant-design/issues/20371
      },
      [`& > *:first-child,
      & > ${antCls}-select:first-child,
      & > ${antCls}-select-auto-complete:first-child ${componentCls},
      & > ${antCls}-cascader-picker:first-child ${componentCls}`]: {
        borderStartStartRadius: token.borderRadius,
        borderEndStartRadius: token.borderRadius
      },
      [`& > *:last-child,
      & > ${antCls}-select:last-child,
      & > ${antCls}-cascader-picker:last-child ${componentCls},
      & > ${antCls}-cascader-picker-focused:last-child ${componentCls}`]: {
        borderInlineEndWidth: token.lineWidth,
        borderStartEndRadius: token.borderRadius,
        borderEndEndRadius: token.borderRadius
      },
      // https://github.com/ant-design/ant-design/issues/12493
      [`& > ${antCls}-select-auto-complete ${componentCls}`]: {
        verticalAlign: 'top'
      },
      [`${componentCls}-group-wrapper + ${componentCls}-group-wrapper`]: {
        marginInlineStart: token.calc(token.lineWidth).mul(-1).equal(),
        [`${componentCls}-affix-wrapper`]: {
          // borderRadius: 0,
        }
      }
    }
  };
};
exports.genInputGroupStyle = genInputGroupStyle;
const genInputStyle = token => {
  const {
    componentCls,
    controlHeightSM,
    lineWidth,
    calc
  } = token;
  const FIXED_CHROME_COLOR_HEIGHT = 16;
  const colorSmallPadding = calc(controlHeightSM).sub(calc(lineWidth).mul(2)).sub(FIXED_CHROME_COLOR_HEIGHT).div(2).equal();
  return {
    [componentCls]: {
      ...(0, _style.resetComponent)(token),
      ...genBasicInputStyle(token),
      // Variants
      ...(0, _variants.genOutlinedStyle)(token),
      ...(0, _variants.genFilledStyle)(token),
      ...(0, _variants.genBorderlessStyle)(token),
      ...(0, _variants.genUnderlinedStyle)(token),
      '&[type="color"]': {
        height: token.controlHeight,
        [`&${componentCls}-lg`]: {
          height: token.controlHeightLG
        },
        [`&${componentCls}-sm`]: {
          height: controlHeightSM,
          paddingTop: colorSmallPadding,
          paddingBottom: colorSmallPadding
        }
      },
      '&[type="search"]::-webkit-search-cancel-button, &[type="search"]::-webkit-search-decoration': {
        appearance: 'none'
      }
    }
  };
};
exports.genInputStyle = genInputStyle;
const genAllowClearStyle = token => {
  const {
    componentCls
  } = token;
  return {
    // ========================= Input =========================
    [`${componentCls}-clear-icon`]: {
      margin: 0,
      padding: 0,
      lineHeight: 0,
      color: token.colorTextQuaternary,
      fontSize: token.fontSizeIcon,
      verticalAlign: -1,
      // https://github.com/ant-design/ant-design/pull/18151
      // https://codesandbox.io/s/wizardly-sun-u10br
      cursor: 'pointer',
      transition: `color ${token.motionDurationSlow}`,
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      '&:hover': {
        color: token.colorIcon
      },
      '&:active': {
        color: token.colorText
      },
      '&-hidden': {
        visibility: 'hidden'
      },
      '&-has-suffix': {
        margin: `0 ${(0, _cssinjs.unit)(token.inputAffixPadding)}`
      }
    }
  };
};
const genAffixStyle = token => {
  const {
    componentCls,
    inputAffixPadding,
    colorTextDescription,
    motionDurationSlow,
    colorIcon,
    colorIconHover,
    iconCls
  } = token;
  const affixCls = `${componentCls}-affix-wrapper`;
  const affixClsDisabled = `${componentCls}-affix-wrapper-disabled`;
  return {
    [affixCls]: {
      ...genBasicInputStyle(token),
      display: 'inline-flex',
      '&-focused, &:focus': {
        zIndex: 1
      },
      [`> input${componentCls}`]: {
        padding: 0
      },
      [`> input${componentCls}, > textarea${componentCls}`]: {
        fontSize: 'inherit',
        border: 'none',
        borderRadius: 0,
        outline: 'none',
        background: 'transparent',
        color: 'inherit',
        '&::-ms-reveal': {
          display: 'none'
        },
        '&:focus': {
          boxShadow: 'none !important'
        }
      },
      '&::before': {
        display: 'inline-block',
        width: 0,
        visibility: 'hidden',
        content: '"\\a0"'
      },
      [componentCls]: {
        '&-prefix, &-suffix': {
          display: 'flex',
          flex: 'none',
          alignItems: 'center',
          '> *:not(:last-child)': {
            marginInlineEnd: token.paddingXS
          }
        },
        '&-show-count-suffix': {
          color: colorTextDescription,
          direction: 'ltr'
        },
        '&-show-count-has-suffix': {
          marginInlineEnd: token.paddingXXS
        },
        '&-prefix': {
          marginInlineEnd: inputAffixPadding
        },
        '&-suffix': {
          marginInlineStart: inputAffixPadding
        }
      },
      ...genAllowClearStyle(token),
      // password
      [`${iconCls}${componentCls}-password-icon`]: {
        color: colorIcon,
        cursor: 'pointer',
        transition: `all ${motionDurationSlow}`,
        '&:hover': {
          color: colorIconHover
        }
      }
    },
    // 覆盖 affix-wrapper borderRadius！
    [`${componentCls}-underlined`]: {
      borderRadius: 0
    },
    [affixClsDisabled]: {
      // password disabled
      [`${iconCls}${componentCls}-password-icon`]: {
        color: colorIcon,
        cursor: 'not-allowed',
        '&:hover': {
          color: colorIcon
        }
      }
    }
  };
};
exports.genAffixStyle = genAffixStyle;
const genGroupStyle = token => {
  const {
    componentCls,
    borderRadiusLG,
    borderRadiusSM
  } = token;
  return {
    [`${componentCls}-group`]: {
      // Style for input-group: input with label, with button or dropdown...
      ...(0, _style.resetComponent)(token),
      ...genInputGroupStyle(token),
      '&-rtl': {
        direction: 'rtl'
      },
      '&-wrapper': {
        display: 'inline-block',
        width: '100%',
        textAlign: 'start',
        verticalAlign: 'top',
        // https://github.com/ant-design/ant-design/issues/6403
        '&-rtl': {
          direction: 'rtl'
        },
        // Size
        '&-lg': {
          [`${componentCls}-group-addon`]: {
            borderRadius: borderRadiusLG,
            fontSize: token.inputFontSizeLG
          }
        },
        '&-sm': {
          [`${componentCls}-group-addon`]: {
            borderRadius: borderRadiusSM
          }
        },
        // Variants
        ...(0, _variants.genOutlinedGroupStyle)(token),
        ...(0, _variants.genFilledGroupStyle)(token),
        // '&-disabled': {
        //   [`${componentCls}-group-addon`]: {
        //     ...genDisabledStyle(token),
        //   },
        // },
        // Fix the issue of using icons in Space Compact mode
        // https://github.com/ant-design/ant-design/issues/42122
        [`&:not(${componentCls}-compact-first-item):not(${componentCls}-compact-last-item)${componentCls}-compact-item`]: {
          [`${componentCls}, ${componentCls}-group-addon`]: {
            borderRadius: 0
          }
        },
        [`&:not(${componentCls}-compact-last-item)${componentCls}-compact-first-item`]: {
          [`${componentCls}, ${componentCls}-group-addon`]: {
            borderStartEndRadius: 0,
            borderEndEndRadius: 0
          }
        },
        [`&:not(${componentCls}-compact-first-item)${componentCls}-compact-last-item`]: {
          [`${componentCls}, ${componentCls}-group-addon`]: {
            borderStartStartRadius: 0,
            borderEndStartRadius: 0
          }
        },
        // Fix the issue of input use show-count param in space compact mode
        // https://github.com/ant-design/ant-design/issues/46872
        [`&:not(${componentCls}-compact-last-item)${componentCls}-compact-item`]: {
          [`${componentCls}-affix-wrapper`]: {
            borderStartEndRadius: 0,
            borderEndEndRadius: 0
          }
        },
        // Fix the issue of input use `addonAfter` param in space compact mode
        // https://github.com/ant-design/ant-design/issues/52483
        [`&:not(${componentCls}-compact-first-item)${componentCls}-compact-item`]: {
          [`${componentCls}-affix-wrapper`]: {
            borderStartStartRadius: 0,
            borderEndStartRadius: 0
          }
        }
      }
    }
  };
};
// ============================== Range ===============================
const genRangeStyle = token => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-out-of-range`]: {
      [`&, & input, & textarea, ${componentCls}-show-count-suffix, ${componentCls}-data-count`]: {
        color: token.colorError
      }
    }
  };
};
// ============================== Export ==============================
const useSharedStyle = exports.useSharedStyle = (0, _internal.genStyleHooks)(['Input', 'Shared'], token => {
  const inputToken = (0, _internal.mergeToken)(token, (0, _token.initInputToken)(token));
  return [genInputStyle(inputToken), genAffixStyle(inputToken)];
}, _token.initComponentToken, {
  resetFont: false
});
var _default = exports.default = (0, _internal.genStyleHooks)(['Input', 'Component'], token => {
  const inputToken = (0, _internal.mergeToken)(token, (0, _token.initInputToken)(token));
  return [genGroupStyle(inputToken), genRangeStyle(inputToken),
  // =====================================================
  // ==             Space Compact                       ==
  // =====================================================
  (0, _compactItem.genCompactItemStyle)(inputToken, {
    focus: true,
    focusElCls: `${inputToken.componentCls}-affix-wrapper-focused`
  })];
}, _token.initComponentToken, {
  resetFont: false
});