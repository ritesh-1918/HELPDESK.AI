"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _style = require("../../style");
const genEllipsisStyle = token => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-cell-ellipsis`]: {
        ..._style.textEllipsis,
        wordBreak: 'keep-all',
        // Fixed first or last should special process
        [`
          &${componentCls}-cell-fix-start-shadow,
          &${componentCls}-cell-fix-end-shadow
        `]: {
          overflow: 'visible',
          [`${componentCls}-cell-content`]: {
            ..._style.textEllipsis,
            display: 'block'
          }
        },
        [`${componentCls}-column-title`]: {
          ..._style.textEllipsis,
          wordBreak: 'keep-all'
        }
      }
    }
  };
};
var _default = exports.default = genEllipsisStyle;