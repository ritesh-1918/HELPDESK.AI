"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareComponentToken = exports.default = exports.LineStrokeColorVar = void 0;
var _cssinjs = require("@ant-design/cssinjs");
var _style = require("../../style");
var _internal = require("../../theme/internal");
const LineStrokeColorVar = exports.LineStrokeColorVar = '--progress-line-stroke-color';
const genAntProgressActive = isRtl => {
  const direction = isRtl ? '100%' : '-100%';
  return new _cssinjs.Keyframes(`antProgress${isRtl ? 'RTL' : 'LTR'}Active`, {
    '0%': {
      transform: `translateX(${direction}) scaleX(0)`,
      opacity: 0.1
    },
    '20%': {
      transform: `translateX(${direction}) scaleX(0)`,
      opacity: 0.5
    },
    to: {
      transform: 'translateX(0) scaleX(1)',
      opacity: 0
    }
  });
};
// ====================================================================
// ==                              Base                              ==
// ====================================================================
const genBaseStyle = token => {
  const {
    componentCls: progressCls,
    iconCls: iconPrefixCls
  } = token;
  return {
    [progressCls]: {
      ...(0, _style.resetComponent)(token),
      display: 'inline-flex',
      '&-rtl': {
        direction: 'rtl'
      },
      [`${progressCls}-indicator`]: {
        color: token.colorText,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        wordBreak: 'normal',
        [iconPrefixCls]: {
          fontSize: token.fontSize
        }
      },
      [`&${progressCls}-status-exception`]: {
        [`${progressCls}-indicator`]: {
          color: token.colorError
        }
      },
      [`&${progressCls}-status-success`]: {
        [`${progressCls}-indicator`]: {
          color: token.colorSuccess
        }
      }
    }
  };
};
// ====================================================================
// ==                              Line                              ==
// ====================================================================
const genLineStyle = token => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-line`]: {
      position: 'relative',
      width: '100%',
      fontSize: token.fontSize,
      [`${componentCls}-body`]: {
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        gap: token.marginXS
      },
      [`${componentCls}-rail`]: {
        flex: 'auto',
        background: token.remainingColor,
        borderRadius: token.lineBorderRadius,
        position: 'relative',
        width: '100%'
      },
      [`&${componentCls}-status-active`]: {
        [`${componentCls}-track:after`]: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundColor: token.colorBgContainer,
          borderRadius: 'inherit',
          opacity: 0,
          animationName: genAntProgressActive(),
          animationDuration: token.progressActiveMotionDuration,
          animationTimingFunction: token.motionEaseOutQuint,
          animationIterationCount: 'infinite'
        }
      },
      [`${componentCls}-track`]: {
        position: 'absolute',
        insetInlineStart: 0,
        insetBlock: 0,
        borderRadius: 'inherit',
        background: token.defaultColor,
        transition: `all ${token.motionDurationSlow} ${token.motionEaseInOutCirc}`,
        minWidth: 'max-content',
        display: 'flex',
        alignItems: 'center',
        '&-success': {
          background: token.colorSuccess
        }
      },
      [`&${componentCls}-status-exception`]: {
        [`${componentCls}-track`]: {
          background: token.colorError
        }
      },
      [`&${componentCls}-status-success`]: {
        [`${componentCls}-track`]: {
          background: token.colorSuccess
        }
      },
      // >>>>> indicator
      // >>> Outer
      [`${componentCls}-indicator-outer`]: {
        [`&${componentCls}-indicator-start`]: {
          order: -1
        }
      },
      [`${componentCls}-body-layout-bottom`]: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: token.marginXXS
      },
      // >>> Inner
      [`${componentCls}-indicator${componentCls}-indicator-inner`]: {
        color: token.colorWhite,
        paddingInline: token.paddingXXS,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        [`&${componentCls}-indicator-end`]: {
          justifyContent: 'end'
        },
        [`&${componentCls}-indicator-start`]: {
          justifyContent: 'start'
        },
        [`&${componentCls}-indicator-bright`]: {
          color: 'rgba(0, 0, 0, 0.45)'
        }
      }
    }
  };
};
// ====================================================================
// ==                             Circle                             ==
// ====================================================================
const genCircleStyle = token => {
  const {
    componentCls: progressCls,
    iconCls: iconPrefixCls
  } = token;
  return {
    [`${progressCls}-circle`]: {
      [`${progressCls}-circle-rail`]: {
        stroke: token.remainingColor
      },
      [`${progressCls}-body:not(${progressCls}-circle-gradient)`]: {
        [`${progressCls}-circle-path`]: {
          stroke: token.defaultColor
        }
      },
      [`${progressCls}-body`]: {
        position: 'relative',
        lineHeight: 1,
        backgroundColor: 'transparent'
      },
      [`${progressCls}-indicator`]: {
        position: 'absolute',
        insetBlockStart: '50%',
        insetInlineStart: 0,
        width: '100%',
        margin: 0,
        padding: 0,
        color: token.circleTextColor,
        fontSize: token.circleTextFontSize,
        lineHeight: 1,
        whiteSpace: 'normal',
        textAlign: 'center',
        transform: 'translateY(-50%)',
        [iconPrefixCls]: {
          fontSize: token.circleIconFontSize
        }
      },
      [`&${progressCls}-status-exception`]: {
        [`${progressCls}-body:not(${progressCls}-circle-gradient)`]: {
          [`${progressCls}-circle-path`]: {
            stroke: token.colorError
          }
        }
      },
      [`&${progressCls}-status-success`]: {
        [`${progressCls}-body:not(${progressCls}-circle-gradient)`]: {
          [`${progressCls}-circle-path`]: {
            stroke: token.colorSuccess
          }
        }
      }
    },
    [`${progressCls}-inline-circle`]: {
      lineHeight: 1,
      [`${progressCls}-inner`]: {
        verticalAlign: 'bottom'
      }
    }
  };
};
// ====================================================================
// ==                              Step                              ==
// ====================================================================
const genStepStyle = token => {
  const {
    componentCls: progressCls
  } = token;
  return {
    [progressCls]: {
      [`${progressCls}-steps`]: {
        display: 'inline-block',
        '&-body': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: token.progressStepMarginInlineEnd,
          [`${progressCls}-indicator`]: {
            marginInlineStart: token.marginXS
          }
        },
        '&-item': {
          flexShrink: 0,
          minWidth: token.progressStepMinWidth,
          backgroundColor: token.remainingColor,
          transition: `all ${token.motionDurationSlow}`,
          '&-active': {
            backgroundColor: token.defaultColor
          }
        }
      }
    }
  };
};
// ====================================================================
// ==                           Small Line                           ==
// ====================================================================
const genSmallLine = token => {
  const {
    componentCls: progressCls,
    iconCls: iconPrefixCls
  } = token;
  return {
    [progressCls]: {
      [`${progressCls}-small&-line, ${progressCls}-small&-line ${progressCls}-indicator ${iconPrefixCls}`]: {
        fontSize: token.fontSizeSM
      }
    }
  };
};
// ====================================================================
// ==                             Export                             ==
// ====================================================================
const prepareComponentToken = token => ({
  circleTextColor: token.colorText,
  defaultColor: token.colorInfo,
  remainingColor: token.colorFillSecondary,
  lineBorderRadius: 100,
  // magic for capsule shape, should be a very large number
  circleTextFontSize: '1em',
  circleIconFontSize: `${token.fontSize / token.fontSizeSM}em`
});
exports.prepareComponentToken = prepareComponentToken;
var _default = exports.default = (0, _internal.genStyleHooks)('Progress', token => {
  const progressStepMarginInlineEnd = token.calc(token.marginXXS).div(2).equal();
  const progressToken = (0, _internal.mergeToken)(token, {
    progressStepMarginInlineEnd,
    progressStepMinWidth: progressStepMarginInlineEnd,
    progressActiveMotionDuration: '2.4s'
  });
  return [genBaseStyle(progressToken), genLineStyle(progressToken), genCircleStyle(progressToken), genStepStyle(progressToken), genSmallLine(progressToken)];
}, prepareComponentToken);