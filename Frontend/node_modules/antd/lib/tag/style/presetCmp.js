"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ = require(".");
var _internal = require("../../theme/internal");
// Style as status component

// ============================== Preset ==============================
const genPresetStyle = token => (0, _internal.genPresetColor)(token, (colorKey, {
  textColor,
  lightBorderColor,
  lightColor,
  darkColor
}) => ({
  [`${token.componentCls}${token.componentCls}-${colorKey}:not(${token.componentCls}-disabled)`]: {
    [`&${token.componentCls}-outlined`]: {
      backgroundColor: lightColor,
      borderColor: lightBorderColor,
      color: textColor
    },
    [`&${token.componentCls}-solid`]: {
      backgroundColor: darkColor,
      borderColor: darkColor,
      color: token.colorTextLightSolid
    },
    [`&${token.componentCls}-filled`]: {
      backgroundColor: lightColor,
      color: textColor
    }
  }
}));
// ============================== Export ==============================
var _default = exports.default = (0, _internal.genSubStyleComponent)(['Tag', 'preset'], token => {
  const tagToken = (0, _.prepareToken)(token);
  return genPresetStyle(tagToken);
}, _.prepareComponentToken);