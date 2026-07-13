"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareToken = exports.prepareComponentToken = exports.default = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _fastColor = require("@ant-design/fast-color");
var _color = require("../../color-picker/color");
var _ColorPresets = require("../../color-picker/components/ColorPresets");
var _style = require("../../style");
var _internal = require("../../theme/internal");
// ============================== Styles ==============================
const genBaseStyle = token => {
  const {
    paddingXXS,
    lineWidth,
    tagPaddingHorizontal,
    componentCls,
    calc
  } = token;
  const paddingInline = calc(tagPaddingHorizontal).sub(lineWidth).equal();
  const iconMarginInline = calc(paddingXXS).sub(lineWidth).equal();
  return {
    // Result
    [componentCls]: {
      ...(0, _style.resetComponent)(token),
      display: 'inline-block',
      height: 'auto',
      paddingInline,
      fontSize: token.tagFontSize,
      lineHeight: token.tagLineHeight,
      whiteSpace: 'nowrap',
      backgroundColor: token.defaultBg,
      border: `${(0, _cssinjs.unit)(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
      borderRadius: token.borderRadiusSM,
      opacity: 1,
      transition: `all ${token.motionDurationMid}`,
      textAlign: 'start',
      position: 'relative',
      // RTL
      [`&${componentCls}-rtl`]: {
        direction: 'rtl'
      },
      '&, a, a:hover': {
        color: token.defaultColor
      },
      [`${componentCls}-close-icon`]: {
        marginInlineStart: iconMarginInline,
        fontSize: token.tagIconSize,
        color: token.colorIcon,
        cursor: 'pointer',
        transition: `all ${token.motionDurationMid}`,
        '&:hover': {
          color: token.colorTextHeading
        }
      },
      '&-checkable': {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        cursor: 'pointer',
        [`&:not(${componentCls}-checkable-checked):hover`]: {
          color: token.colorPrimary,
          backgroundColor: token.colorFillSecondary
        },
        '&:active, &-checked': {
          color: token.colorTextLightSolid
        },
        '&-checked': {
          backgroundColor: token.colorPrimary,
          '&:hover': {
            backgroundColor: token.colorPrimaryHover
          }
        },
        '&:active': {
          backgroundColor: token.colorPrimaryActive
        },
        '&-disabled': {
          cursor: 'not-allowed',
          [`&:not(${componentCls}-checkable-checked)`]: {
            color: token.colorTextDisabled,
            '&:hover': {
              backgroundColor: 'transparent'
            }
          },
          [`&${componentCls}-checkable-checked`]: {
            color: token.colorTextDisabled,
            backgroundColor: token.colorBgContainerDisabled
          },
          '&:hover, &:active': {
            backgroundColor: token.colorBgContainerDisabled,
            color: token.colorTextDisabled
          },
          [`&:not(${componentCls}-checkable-checked):hover`]: {
            color: token.colorTextDisabled
          }
        },
        '&-group': {
          display: 'flex',
          flexWrap: 'wrap',
          gap: token.paddingXS
        }
      },
      '&-hidden': {
        display: 'none'
      },
      // To ensure that a space will be placed between character and `Icon`.
      [`> ${token.iconCls} + span, > span + ${token.iconCls}`]: {
        marginInlineStart: paddingInline
      }
    },
    [`&${token.componentCls}-solid`]: {
      borderColor: 'transparent',
      color: token.colorTextLightSolid,
      backgroundColor: token.colorBgSolid,
      [`&${componentCls}-default`]: {
        color: token.solidTextColor
      }
    },
    [`${componentCls}-filled`]: {
      borderColor: 'transparent',
      backgroundColor: token.tagBorderlessBg
    },
    [`&${componentCls}-disabled`]: {
      color: token.colorTextDisabled,
      cursor: 'not-allowed',
      backgroundColor: token.colorBgContainerDisabled,
      a: {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        color: token.colorTextDisabled,
        '&:hover': {
          color: token.colorTextDisabled
        }
      },
      'a&': {
        '&:hover, &:active': {
          color: token.colorTextDisabled
        }
      },
      [`&${componentCls}-outlined`]: {
        borderColor: token.colorBorderDisabled
      },
      [`&${componentCls}-solid, &${componentCls}-filled`]: {
        color: token.colorTextDisabled,
        [`${componentCls}-close-icon`]: {
          color: token.colorTextDisabled
        }
      },
      [`${componentCls}-close-icon`]: {
        cursor: 'not-allowed',
        color: token.colorTextDisabled,
        '&:hover': {
          color: token.colorTextDisabled
        }
      }
    }
  };
};
// ============================== Export ==============================
const prepareToken = token => {
  const {
    lineWidth,
    fontSizeIcon,
    calc
  } = token;
  const tagFontSize = token.fontSizeSM;
  const tagToken = (0, _internal.mergeToken)(token, {
    tagFontSize,
    tagLineHeight: (0, _cssinjs.unit)(calc(token.lineHeightSM).mul(tagFontSize).equal()),
    tagIconSize: calc(fontSizeIcon).sub(calc(lineWidth).mul(2)).equal(),
    // Tag icon is much smaller
    tagPaddingHorizontal: 8,
    // Fixed padding.
    tagBorderlessBg: token.defaultBg
  });
  return tagToken;
};
exports.prepareToken = prepareToken;
const prepareComponentToken = token => {
  const solidTextColor = (0, _ColorPresets.isBright)(new _color.AggregationColor(token.colorBgSolid), '#fff') ? '#000' : '#fff';
  return {
    defaultBg: new _fastColor.FastColor(token.colorFillTertiary).onBackground(token.colorBgContainer).toHexString(),
    defaultColor: token.colorText,
    solidTextColor
  };
};
exports.prepareComponentToken = prepareComponentToken;
var _default = exports.default = (0, _internal.genStyleHooks)('Tag', token => {
  const tagToken = prepareToken(token);
  return genBaseStyle(tagToken);
}, prepareComponentToken);