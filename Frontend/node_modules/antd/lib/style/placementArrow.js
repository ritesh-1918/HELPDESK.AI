"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.MAX_VERTICAL_CONTENT_RADIUS = void 0;
exports.getArrowOffsetToken = getArrowOffsetToken;
var _cssinjs = require("@ant-design/cssinjs");
var _genStyleUtils = require("../theme/util/genStyleUtils");
var _roundedArrow = require("./roundedArrow");
const MAX_VERTICAL_CONTENT_RADIUS = exports.MAX_VERTICAL_CONTENT_RADIUS = 8;
function getArrowOffsetToken(options) {
  const {
    contentRadius,
    limitVerticalRadius
  } = options;
  const arrowOffset = contentRadius > 12 ? contentRadius + 2 : 12;
  const arrowOffsetVertical = limitVerticalRadius ? MAX_VERTICAL_CONTENT_RADIUS : arrowOffset;
  return {
    arrowOffsetHorizontal: arrowOffset,
    arrowOffsetVertical
  };
}
function isInject(valid, code) {
  if (!valid) {
    return {};
  }
  return code;
}
const getArrowStyle = (token, colorBg, options) => {
  const {
    componentCls,
    boxShadowPopoverArrow,
    arrowOffsetVertical,
    arrowOffsetHorizontal,
    antCls
  } = token;
  const [varName] = (0, _genStyleUtils.genCssVar)(antCls, 'tooltip');
  const {
    arrowDistance = 0,
    arrowPlacement = {
      left: true,
      right: true,
      top: true,
      bottom: true
    }
  } = options || {};
  return {
    [componentCls]: {
      // ============================ Basic ============================
      [`${componentCls}-arrow`]: [{
        position: 'absolute',
        zIndex: 1,
        // lift it up so the menu wouldn't cask shadow on it
        display: 'block',
        ...(0, _roundedArrow.genRoundedArrow)(token, colorBg, boxShadowPopoverArrow),
        '&:before': {
          background: colorBg
        }
      }],
      // ========================== Placement ==========================
      // Here handle the arrow position and rotate stuff
      // >>>>> Top
      ...isInject(!!arrowPlacement.top, {
        [[`&-placement-top > ${componentCls}-arrow`, `&-placement-topLeft > ${componentCls}-arrow`, `&-placement-topRight > ${componentCls}-arrow`].join(',')]: {
          bottom: arrowDistance,
          transform: 'translateY(100%) rotate(180deg)'
        },
        [`&-placement-top > ${componentCls}-arrow`]: {
          left: {
            _skip_check_: true,
            value: '50%'
          },
          transform: 'translateX(-50%) translateY(100%) rotate(180deg)'
        },
        '&-placement-topLeft': {
          [varName('arrow-offset-x')]: arrowOffsetHorizontal,
          [`> ${componentCls}-arrow`]: {
            left: {
              _skip_check_: true,
              value: arrowOffsetHorizontal
            }
          }
        },
        '&-placement-topRight': {
          [varName('arrow-offset-x')]: `calc(100% - ${(0, _cssinjs.unit)(arrowOffsetHorizontal)})`,
          [`> ${componentCls}-arrow`]: {
            right: {
              _skip_check_: true,
              value: arrowOffsetHorizontal
            }
          }
        }
      }),
      // >>>>> Bottom
      ...isInject(!!arrowPlacement.bottom, {
        [[`&-placement-bottom > ${componentCls}-arrow`, `&-placement-bottomLeft > ${componentCls}-arrow`, `&-placement-bottomRight > ${componentCls}-arrow`].join(',')]: {
          top: arrowDistance,
          transform: `translateY(-100%)`
        },
        [`&-placement-bottom > ${componentCls}-arrow`]: {
          left: {
            _skip_check_: true,
            value: '50%'
          },
          transform: `translateX(-50%) translateY(-100%)`
        },
        '&-placement-bottomLeft': {
          [varName('arrow-offset-x')]: arrowOffsetHorizontal,
          [`> ${componentCls}-arrow`]: {
            left: {
              _skip_check_: true,
              value: arrowOffsetHorizontal
            }
          }
        },
        '&-placement-bottomRight': {
          [varName('arrow-offset-x')]: `calc(100% - ${(0, _cssinjs.unit)(arrowOffsetHorizontal)})`,
          [`> ${componentCls}-arrow`]: {
            right: {
              _skip_check_: true,
              value: arrowOffsetHorizontal
            }
          }
        }
      }),
      // >>>>> Left
      ...isInject(!!arrowPlacement.left, {
        [[`&-placement-left > ${componentCls}-arrow`, `&-placement-leftTop > ${componentCls}-arrow`, `&-placement-leftBottom > ${componentCls}-arrow`].join(',')]: {
          right: {
            _skip_check_: true,
            value: arrowDistance
          },
          transform: 'translateX(100%) rotate(90deg)'
        },
        [`&-placement-left > ${componentCls}-arrow`]: {
          top: {
            _skip_check_: true,
            value: '50%'
          },
          transform: 'translateY(-50%) translateX(100%) rotate(90deg)'
        },
        [`&-placement-leftTop > ${componentCls}-arrow`]: {
          top: arrowOffsetVertical
        },
        [`&-placement-leftBottom > ${componentCls}-arrow`]: {
          bottom: arrowOffsetVertical
        }
      }),
      // >>>>> Right
      ...isInject(!!arrowPlacement.right, {
        [[`&-placement-right > ${componentCls}-arrow`, `&-placement-rightTop > ${componentCls}-arrow`, `&-placement-rightBottom > ${componentCls}-arrow`].join(',')]: {
          left: {
            _skip_check_: true,
            value: arrowDistance
          },
          transform: 'translateX(-100%) rotate(-90deg)'
        },
        [`&-placement-right > ${componentCls}-arrow`]: {
          top: {
            _skip_check_: true,
            value: '50%'
          },
          transform: 'translateY(-50%) translateX(-100%) rotate(-90deg)'
        },
        [`&-placement-rightTop > ${componentCls}-arrow`]: {
          top: arrowOffsetVertical
        },
        [`&-placement-rightBottom > ${componentCls}-arrow`]: {
          bottom: arrowOffsetVertical
        }
      })
    }
  };
};
var _default = exports.default = getArrowStyle;