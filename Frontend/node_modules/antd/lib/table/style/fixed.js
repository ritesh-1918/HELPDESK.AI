"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getShadowStyle = getShadowStyle;
function getShadowStyle({
  colorSplit: shadowColor
}) {
  const leftShadowStyle = {
    boxShadow: `inset 10px 0 8px -8px ${shadowColor}`
  };
  const rightShadowStyle = {
    boxShadow: `inset -10px 0 8px -8px ${shadowColor}`
  };
  return [leftShadowStyle, rightShadowStyle];
}
const genFixedStyle = token => {
  const {
    componentCls,
    lineWidth,
    motionDurationSlow,
    zIndexTableFixed,
    tableBg,
    calc
  } = token;
  const cellCls = `${componentCls}-cell`;
  const fixCellCls = `${cellCls}-fix`;
  const sharedShadowStyle = {
    position: 'absolute',
    top: 0,
    bottom: calc(lineWidth).mul(-1).equal(),
    width: 30,
    transition: `box-shadow ${motionDurationSlow}`,
    content: '""',
    pointerEvents: 'none'
  };
  const [leftShadowStyle, rightShadowStyle] = getShadowStyle(token);
  // Follow style is magic of shadow which should not follow token:
  return {
    [`${componentCls}-wrapper`]: {
      // ====================== Cell ======================
      [`${cellCls}${fixCellCls}`]: {
        position: 'sticky'
      },
      [fixCellCls]: {
        zIndex: `calc(var(--z-offset-reverse) + ${zIndexTableFixed})`,
        background: tableBg,
        '&:after': sharedShadowStyle,
        // Position
        '&-start:after': {
          insetInlineStart: '100%'
        },
        '&-end:after': {
          insetInlineEnd: '100%'
        },
        // visible
        '&-start-shadow-show:after': leftShadowStyle,
        '&-end-shadow-show:after': rightShadowStyle
      },
      // =================== Container ====================
      [`${componentCls}-container`]: {
        position: 'relative',
        '&:before, &:after': {
          ...sharedShadowStyle,
          zIndex: `calc(var(--columns-count) * 2 + ${zIndexTableFixed} + 1)`
        },
        '&:before': {
          insetInlineStart: 0
        },
        '&:after': {
          insetInlineEnd: 0
        }
      },
      [`${componentCls}-has-fix-start ${componentCls}-container:before`]: {
        display: 'none'
      },
      [`${componentCls}-has-fix-end ${componentCls}-container:after`]: {
        display: 'none'
      },
      [`${componentCls}-fix-start-shadow-show ${componentCls}-container:before`]: leftShadowStyle,
      [`${componentCls}-fix-end-shadow-show ${componentCls}-container:after`]: rightShadowStyle
    }
  };
};
var _default = exports.default = genFixedStyle;