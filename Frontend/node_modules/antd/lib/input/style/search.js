"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _internal = require("../../theme/internal");
const genSearchStyle = token => {
  const {
    componentCls
  } = token;
  const btnCls = `${componentCls}-btn`;
  return {
    [componentCls]: {
      width: '100%',
      // =========================== Button ===========================
      [btnCls]: {
        '&-filled': {
          background: token.colorFillTertiary,
          '&:not(:disabled)': {
            '&:hover': {
              background: token.colorFillSecondary
            },
            '&:active': {
              background: token.colorFill
            }
          }
        }
      }
    }
  };
};
var _default = exports.default = (0, _internal.genStyleHooks)(['Input', 'Search'], token => {
  return [genSearchStyle(token)];
});