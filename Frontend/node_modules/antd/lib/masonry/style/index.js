"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genMasonryStyle = exports.default = void 0;
var _internal = require("../../theme/internal");
const genMasonryStyle = token => {
  const {
    componentCls
  } = token;
  const itemCls = `${componentCls}-item`;
  return {
    [componentCls]: {
      position: 'relative',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'wrap',
      '&-rtl': {
        direction: 'rtl'
      },
      [`& > ${itemCls}`]: {
        boxSizing: 'border-box',
        // Motion
        '&-fade': {
          '&-appear': {
            transition: `opacity ${token.motionDurationSlow} ${token.motionEaseOut}`,
            opacity: 0,
            '&-active': {
              opacity: 1
            }
          },
          '&-leave': {
            transition: `opacity ${token.motionDurationFast} ${token.motionEaseOut}`,
            opacity: 1,
            '&-active': {
              opacity: 0
            }
          }
        },
        [`&:not(${itemCls}-fade)`]: {
          transition: ['left', 'right', 'top'].map(prop => `${prop} ${token.motionDurationSlow} ${token.motionEaseOut}`).join(',')
        }
      }
    }
  };
};
exports.genMasonryStyle = genMasonryStyle;
var _default = exports.default = (0, _internal.genStyleHooks)('Masonry', token => [genMasonryStyle(token)]);