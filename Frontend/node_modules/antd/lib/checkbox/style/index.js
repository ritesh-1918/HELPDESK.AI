"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genCheckboxStyle = exports.default = void 0;
exports.getStyle = getStyle;
var _cssinjs = require("@ant-design/cssinjs");
var _style = require("../../style");
var _internal = require("../../theme/internal");
// ============================== Styles ==============================
const genCheckboxStyle = token => {
  const {
    checkboxCls,
    checkboxSize,
    lineWidth
  } = token;
  const wrapperCls = `${checkboxCls}-wrapper`;
  return [
  // ===================== Basic =====================
  {
    // Group
    [`${checkboxCls}-group`]: {
      ...(0, _style.resetComponent)(token),
      display: 'inline-flex',
      flexWrap: 'wrap',
      columnGap: token.marginXS,
      // Group > Grid
      [`> ${token.antCls}-row`]: {
        flex: 1
      }
    },
    // Wrapper
    [wrapperCls]: {
      ...(0, _style.resetComponent)(token),
      display: 'inline-flex',
      alignItems: 'baseline',
      cursor: 'pointer',
      // Fix checkbox & radio in flex align #30260
      '&:after': {
        display: 'inline-block',
        width: 0,
        overflow: 'hidden',
        content: "'\\a0'"
      },
      // Checkbox near checkbox
      [`& + ${wrapperCls}`]: {
        marginInlineStart: 0
      },
      [`&${wrapperCls}-in-form-item`]: {
        'input[type="checkbox"]': {
          width: 14,
          // FIXME: magic
          height: 14 // FIXME: magic
        }
      }
    },
    // Wrapper > Checkbox
    [checkboxCls]: {
      ...(0, _style.resetComponent)(token),
      position: 'relative',
      whiteSpace: 'nowrap',
      lineHeight: 1,
      cursor: 'pointer',
      // To make alignment right when `controlHeight` is changed
      // Ref: https://github.com/ant-design/ant-design/issues/41564
      alignSelf: 'center',
      // Styles moved from inner
      boxSizing: 'border-box',
      display: 'block',
      width: checkboxSize,
      height: checkboxSize,
      direction: 'ltr',
      backgroundColor: token.colorBgContainer,
      border: `${(0, _cssinjs.unit)(lineWidth)} ${token.lineType} ${token.colorBorder}`,
      borderRadius: token.borderRadiusSM,
      borderCollapse: 'separate',
      transition: `all ${token.motionDurationSlow}`,
      // Checkmark
      '&:after': {
        boxSizing: 'border-box',
        position: 'absolute',
        top: `calc(${checkboxSize} / 2 - ${lineWidth})`,
        insetInlineStart: `calc(${checkboxSize} / 4 - ${lineWidth})`,
        display: 'table',
        width: token.calc(checkboxSize).div(14).mul(5).equal(),
        height: token.calc(checkboxSize).div(14).mul(8).equal(),
        border: `${(0, _cssinjs.unit)(token.lineWidthBold)} solid ${token.colorWhite}`,
        borderTop: 0,
        borderInlineStart: 0,
        transform: 'rotate(45deg) scale(0) translate(-50%,-50%)',
        opacity: 0,
        content: '""',
        transition: `all ${token.motionDurationFast} ${token.motionEaseInBack}, opacity ${token.motionDurationFast}`
      },
      // Wrapper > Checkbox > input
      [`${checkboxCls}-input`]: {
        position: 'absolute',
        // Since baseline align will get additional space offset,
        // we need to move input to top to make it align with text.
        // Ref: https://github.com/ant-design/ant-design/issues/38926#issuecomment-1486137799
        inset: `calc(-1 * (${lineWidth}))`,
        zIndex: 1,
        cursor: 'pointer',
        opacity: 0,
        margin: 0
      },
      // Focus outline on checkbox when input is focus-visible
      [`&:has(${checkboxCls}-input:focus-visible)`]: (0, _style.genFocusOutline)(token),
      // Wrapper > Checkbox + Text
      '& + span': {
        paddingInlineStart: token.paddingXS,
        paddingInlineEnd: token.paddingXS
      }
    }
  },
  // ===================== Hover =====================
  {
    // Wrapper & Wrapper > Checkbox
    [`
        ${wrapperCls}:not(${wrapperCls}-disabled),
        ${checkboxCls}:not(${checkboxCls}-disabled)
      `]: {
      [`&:hover ${checkboxCls}`]: {
        borderColor: token.colorPrimary
      }
    },
    [`${wrapperCls}:not(${wrapperCls}-disabled)`]: {
      [`&:hover ${checkboxCls}-checked:not(${checkboxCls}-disabled)`]: {
        backgroundColor: token.colorPrimaryHover,
        borderColor: 'transparent'
      }
    }
  },
  // ==================== Checked ====================
  {
    // Wrapper > Checkbox
    [`${checkboxCls}-checked`]: {
      backgroundColor: token.colorPrimary,
      borderColor: token.colorPrimary,
      '&:after': {
        opacity: 1,
        transform: 'rotate(45deg) scale(1) translate(-50%,-50%)',
        transition: `all ${token.motionDurationMid} ${token.motionEaseOutBack} ${token.motionDurationFast}`
      },
      // Hover on checked checkbox directly
      [`&:not(${checkboxCls}-disabled):hover`]: {
        backgroundColor: token.colorPrimaryHover,
        borderColor: 'transparent'
      }
    }
  },
  // ================= Indeterminate =================
  {
    [checkboxCls]: {
      '&-indeterminate': {
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        '&:after': {
          top: '50%',
          insetInlineStart: '50%',
          width: token.calc(token.fontSizeLG).div(2).equal(),
          height: token.calc(token.fontSizeLG).div(2).equal(),
          backgroundColor: token.colorPrimary,
          border: 0,
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          content: '""'
        },
        // https://github.com/ant-design/ant-design/issues/50074
        '&:hover': {
          backgroundColor: token.colorBgContainer,
          borderColor: token.colorPrimary
        }
      }
    }
  },
  // ==================== Disable ====================
  {
    // Wrapper
    [`${wrapperCls}-disabled`]: {
      cursor: 'not-allowed'
    },
    // Wrapper > Checkbox
    [`${checkboxCls}-disabled`]: {
      // Wrapper > Checkbox > input
      [`&, ${checkboxCls}-input`]: {
        cursor: 'not-allowed',
        // Disabled for native input to enable Tooltip event handler
        // ref: https://github.com/ant-design/ant-design/issues/39822#issuecomment-1365075901
        pointerEvents: 'none'
      },
      // Disabled checkbox styles
      background: token.colorBgContainerDisabled,
      borderColor: token.colorBorder,
      '&:after': {
        borderColor: token.colorTextDisabled
      },
      '& + span': {
        color: token.colorTextDisabled
      },
      [`&${checkboxCls}-indeterminate::after`]: {
        background: token.colorTextDisabled
      }
    }
  }];
};
// ============================== Export ==============================
exports.genCheckboxStyle = genCheckboxStyle;
function getStyle(prefixCls, token) {
  const checkboxToken = (0, _internal.mergeToken)(token, {
    checkboxCls: `.${prefixCls}`,
    checkboxSize: token.controlInteractiveSize
  });
  return genCheckboxStyle(checkboxToken);
}
var _default = exports.default = (0, _internal.genStyleHooks)('Checkbox', (token, {
  prefixCls
}) => [getStyle(prefixCls, token)]);