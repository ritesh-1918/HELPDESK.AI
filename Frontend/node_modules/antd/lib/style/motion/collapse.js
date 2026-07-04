"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const genCollapseMotion = token => {
  const {
    componentCls,
    antCls,
    motionDurationMid,
    motionEaseInOut
  } = token;
  return {
    [componentCls]: {
      // For common/openAnimation
      [`${antCls}-motion-collapse-legacy`]: {
        overflow: 'hidden',
        '&-active': {
          transition: `${['height', 'opacity'].map(prop => `${prop} ${motionDurationMid} ${motionEaseInOut}`).join(', ')} !important`
        }
      },
      [`${antCls}-motion-collapse`]: {
        overflow: 'hidden',
        transition: `${['height', 'opacity'].map(prop => `${prop} ${motionDurationMid} ${motionEaseInOut}`).join(', ')} !important`
      }
    }
  };
};
var _default = exports.default = genCollapseMotion;