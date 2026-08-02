"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareComponentToken = exports.genImagePreviewStyle = exports.genImageCoverStyle = exports.genBoxStyle = exports.default = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _fastColor = require("@ant-design/fast-color");
var _internal = require("../../theme/internal");
const genBoxStyle = position => ({
  position: position || 'absolute',
  inset: 0
});
exports.genBoxStyle = genBoxStyle;
const genImageCoverStyle = token => {
  const {
    componentCls,
    motionDurationSlow,
    colorTextLightSolid
  } = token;
  return {
    [componentCls]: {
      [`${componentCls}-cover`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colorTextLightSolid,
        background: new _fastColor.FastColor('#000').setA(0.3).toRgbString(),
        cursor: 'pointer',
        opacity: 0,
        transition: `opacity ${motionDurationSlow}`
      },
      '&:hover': {
        [`${componentCls}-cover`]: {
          opacity: 1
        }
      },
      [`${componentCls}-cover-top`]: {
        inset: '0 0 auto 0',
        justifyContent: 'center'
      },
      [`${componentCls}-cover-bottom`]: {
        inset: 'auto 0 0 0',
        justifyContent: 'center'
      }
    }
  };
};
exports.genImageCoverStyle = genImageCoverStyle;
const genImagePreviewStyle = token => {
  const {
    motionEaseOut,
    previewCls,
    motionDurationSlow,
    componentCls,
    colorBgMask,
    marginXL,
    marginSM,
    margin,
    colorTextLightSolid,
    paddingSM,
    paddingLG,
    previewOperationHoverColor,
    previewOperationColorDisabled,
    previewOperationSize,
    zIndexPopup
  } = token;
  const operationBg = new _fastColor.FastColor(colorBgMask).setA(0.1);
  const operationBgHover = operationBg.clone().setA(0.2);
  const singleBtn = {
    position: 'absolute',
    color: colorTextLightSolid,
    backgroundColor: operationBg.toRgbString(),
    borderRadius: '50%',
    padding: paddingSM,
    outline: 0,
    border: 0,
    cursor: 'pointer',
    transition: `all ${motionDurationSlow}`,
    display: 'flex',
    fontSize: previewOperationSize,
    '&:hover': {
      backgroundColor: operationBgHover.toRgbString()
    },
    '&:active': {
      backgroundColor: operationBg.toRgbString()
    }
  };
  return {
    [`${componentCls}-preview`]: {
      textAlign: 'center',
      inset: 0,
      position: 'fixed',
      userSelect: 'none',
      zIndex: zIndexPopup,
      // ================= Mask =================
      [`${previewCls}-mask`]: {
        inset: 0,
        position: 'absolute',
        background: colorBgMask,
        [`&${componentCls}-preview-mask-blur`]: {
          backdropFilter: 'blur(4px)'
        },
        [`&${componentCls}-preview-mask-hidden`]: {
          display: 'none'
        }
      },
      // ================= Body =================
      [`${previewCls}-body`]: {
        ...genBoxStyle(),
        'pointer-events': 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '> *': {
          pointerEvents: 'auto'
        }
      },
      // Body > Image
      [`${previewCls}-img`]: {
        maxWidth: '100%',
        maxHeight: '70%',
        verticalAlign: 'middle',
        transform: 'scale3d(1, 1, 1)',
        cursor: 'grab',
        transition: `transform ${motionDurationSlow} ${motionEaseOut} 0s`
      },
      [`&-moving ${previewCls}-img`]: {
        cursor: 'grabbing'
      },
      // =============== CloseBtn ===============
      [`${previewCls}-close`]: {
        // Shared style
        ...singleBtn,
        top: marginSM,
        insetInlineEnd: marginSM
      },
      // ================ Switch ================
      [`${previewCls}-switch`]: {
        ...singleBtn,
        top: '50%',
        transform: `translateY(-50%)`,
        '&-disabled': {
          '&, &:hover, &:active': {
            color: previewOperationColorDisabled,
            background: 'transparent',
            cursor: 'not-allowed'
          }
        },
        '&-prev': {
          insetInlineStart: marginSM
        },
        '&-next': {
          insetInlineEnd: marginSM
        }
      },
      // ================ Footer ================
      [`${previewCls}-footer`]: {
        position: 'absolute',
        bottom: marginXL,
        left: {
          _skip_check_: true,
          value: '50%'
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: token.previewOperationColor,
        transform: 'translateX(-50%)',
        gap: margin
      },
      // =============== Actions ================
      [`${previewCls}-actions`]: {
        display: 'flex',
        gap: paddingSM,
        padding: `0 ${(0, _cssinjs.unit)(paddingLG)}`,
        backgroundColor: operationBg.toRgbString(),
        borderRadius: 100,
        fontSize: previewOperationSize,
        '&-action': {
          padding: paddingSM,
          cursor: 'pointer',
          transition: `all ${motionDurationSlow}`,
          display: 'flex',
          [`&:not(${previewCls}-actions-action-disabled):hover`]: {
            color: previewOperationHoverColor
          },
          '&-disabled': {
            color: previewOperationColorDisabled,
            cursor: 'not-allowed'
          }
        }
      }
    }
  };
};
exports.genImagePreviewStyle = genImagePreviewStyle;
const genImageStyle = token => {
  const {
    componentCls
  } = token;
  return {
    // ============================== image ==============================
    [componentCls]: {
      position: 'relative',
      display: 'inline-block',
      [`${componentCls}-img`]: {
        width: '100%',
        height: 'auto',
        verticalAlign: 'middle'
      },
      [`${componentCls}-img-placeholder`]: {
        backgroundColor: token.colorBgContainerDisabled,
        backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQuNSAyLjVoLTEzQS41LjUgMCAwIDAgMSAzdjEwYS41LjUgMCAwIDAgLjUuNWgxM2EuNS41IDAgMCAwIC41LS41VjNhLjUuNSAwIDAgMC0uNS0uNXpNNS4yODEgNC43NWExIDEgMCAwIDEgMCAyIDEgMSAwIDAgMSAwLTJ6bTguMDMgNi44M2EuMTI3LjEyNyAwIDAgMS0uMDgxLjAzSDIuNzY5YS4xMjUuMTI1IDAgMCAxLS4wOTYtLjIwN2wyLjY2MS0zLjE1NmEuMTI2LjEyNiAwIDAgMSAuMTc3LS4wMTZsLjAxNi4wMTZMNy4wOCAxMC4wOWwyLjQ3LTIuOTNhLjEyNi4xMjYgMCAwIDEgLjE3Ny0uMDE2bC4wMTUuMDE2IDMuNTg4IDQuMjQ0YS4xMjcuMTI3IDAgMCAxLS4wMi4xNzV6IiBmaWxsPSIjOEM4QzhDIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: '30%'
      },
      [`${componentCls}-placeholder`]: {
        ...genBoxStyle()
      }
    }
  };
};
const genPreviewMotion = token => {
  const {
    previewCls,
    motionDurationSlow
  } = token;
  return {
    [previewCls]: {
      '&-fade': {
        transition: `opacity ${motionDurationSlow}`,
        '&-enter, &-appear': {
          opacity: 0,
          [`${previewCls}-body`]: {
            transform: 'scale(0)'
          },
          '&-active': {
            opacity: 1,
            [`${previewCls}-body`]: {
              transform: 'scale(1)',
              transition: `transform ${motionDurationSlow}`
            }
          }
        },
        '&-leave': {
          opacity: 1,
          '&-active': {
            opacity: 0,
            [`${previewCls}-body`]: {
              transform: 'scale(0)',
              transition: `transform ${motionDurationSlow}`
            }
          }
        }
      }
    }
  };
};
// ============================== Export ==============================
const prepareComponentToken = token => ({
  zIndexPopup: token.zIndexPopupBase + 80,
  previewOperationColor: new _fastColor.FastColor(token.colorTextLightSolid).setA(0.65).toRgbString(),
  previewOperationHoverColor: new _fastColor.FastColor(token.colorTextLightSolid).setA(0.85).toRgbString(),
  previewOperationColorDisabled: new _fastColor.FastColor(token.colorTextLightSolid).setA(0.25).toRgbString(),
  previewOperationSize: token.fontSizeIcon * 1.5 // FIXME: fontSizeIconLG
});
exports.prepareComponentToken = prepareComponentToken;
var _default = exports.default = (0, _internal.genStyleHooks)('Image', token => {
  const previewCls = `${token.componentCls}-preview`;
  const imageToken = (0, _internal.mergeToken)(token, {
    previewCls,
    imagePreviewSwitchSize: token.controlHeightLG
  });
  return [genImageStyle(imageToken), genImageCoverStyle(imageToken), genImagePreviewStyle(imageToken), genPreviewMotion(imageToken)];
}, prepareComponentToken);