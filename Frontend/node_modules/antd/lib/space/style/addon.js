"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compactItem = require("../../style/compact-item");
var _internal = require("../../theme/internal");
var _genStyleUtils = require("../../theme/util/genStyleUtils");
const genSpaceAddonStyle = token => {
  const {
    componentCls,
    borderRadius,
    paddingSM,
    colorBorder,
    paddingXS,
    fontSizeLG,
    fontSizeSM,
    borderRadiusLG,
    borderRadiusSM,
    colorBgContainerDisabled,
    lineWidth,
    antCls
  } = token;
  const [varName, varRef] = (0, _genStyleUtils.genCssVar)(antCls, 'space');
  return {
    [componentCls]: [
    // ==========================================================
    // ==                         Base                         ==
    // ==========================================================
    {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0,
      paddingInline: paddingSM,
      margin: 0,
      borderWidth: lineWidth,
      borderStyle: 'solid',
      borderRadius,
      '&:hover': {
        zIndex: 0
      },
      [`&${componentCls}-disabled`]: {
        color: token.colorTextDisabled
      },
      '&-large': {
        fontSize: fontSizeLG,
        borderRadius: borderRadiusLG
      },
      '&-small': {
        paddingInline: paddingXS,
        borderRadius: borderRadiusSM,
        fontSize: fontSizeSM
      },
      '&-compact-last-item': {
        borderEndStartRadius: 0,
        borderStartStartRadius: 0
      },
      '&-compact-first-item': {
        borderEndEndRadius: 0,
        borderStartEndRadius: 0
      },
      '&-compact-item:not(:first-child):not(:last-child)': {
        borderRadius: 0
      },
      '&-compact-item:not(:last-child)': {
        borderInlineEndWidth: 0
      },
      '&-compact-item:not(:first-child)': {
        borderInlineStartWidth: 0
      }
    },
    // ==========================================================
    // ==                       Variants                       ==
    // ==========================================================
    {
      [varName('addon-border-color')]: colorBorder,
      [varName('addon-background')]: colorBgContainerDisabled,
      // Filled
      [varName('addon-border-color-outlined')]: colorBorder,
      [varName('addon-background-filled')]: colorBgContainerDisabled,
      borderColor: varRef('addon-border-color'),
      background: varRef('addon-background'),
      // ======================= Outlined =======================
      '&-variant-outlined': {
        [varName('addon-border-color')]: varRef('addon-border-color-outlined')
      },
      // ======================== Filled ========================
      '&-variant-filled': {
        [varName('addon-border-color')]: 'transparent',
        [varName('addon-background')]: varRef('addon-background-filled'),
        // Disabled
        [`&${componentCls}-disabled`]: {
          [varName('addon-border-color')]: colorBorder,
          [varName('addon-background')]: colorBgContainerDisabled
        }
      },
      // ====================== Borderless ======================
      '&-variant-borderless': {
        border: 'none',
        background: 'transparent'
      },
      // ====================== Underlined ======================
      '&-variant-underlined': {
        border: 'none',
        background: 'transparent'
      }
    },
    // ==========================================================
    // ==                        Status                        ==
    // ==========================================================
    {
      '&-status-error': {
        [varName('addon-border-color-outlined')]: token.colorError,
        [varName('addon-background-filled')]: token.colorErrorBg,
        color: token.colorError
      },
      '&-status-warning': {
        [varName('addon-border-color-outlined')]: token.colorWarning,
        [varName('addon-background-filled')]: token.colorWarningBg,
        color: token.colorWarning
      }
    }]
  };
};
// ============================== Export ==============================
var _default = exports.default = (0, _internal.genStyleHooks)(['Space', 'Addon'], token => [genSpaceAddonStyle(token), (0, _compactItem.genCompactItemStyle)(token, {
  focus: false
})]);