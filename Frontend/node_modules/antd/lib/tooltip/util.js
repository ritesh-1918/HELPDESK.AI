"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseColor = void 0;
var _clsx = require("clsx");
var _colors = require("../_util/colors");
var _util = require("../color-picker/util");
var _genStyleUtils = require("../theme/util/genStyleUtils");
const parseColor = (rootPrefixCls, prefixCls, color) => {
  const isInternalColor = (0, _colors.isPresetColor)(color);
  const [varName] = (0, _genStyleUtils.genCssVar)(rootPrefixCls, 'tooltip');
  const className = (0, _clsx.clsx)({
    [`${prefixCls}-${color}`]: color && isInternalColor
  });
  const overlayStyle = {};
  const arrowStyle = {};
  const rgb = (0, _util.generateColor)(color).toRgb();
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance < 0.5 ? '#FFF' : '#000';
  if (color && !isInternalColor) {
    overlayStyle.background = color;
    overlayStyle[varName('overlay-color')] = textColor;
    arrowStyle[varName('arrow-background-color')] = color;
  }
  return {
    className,
    overlayStyle,
    arrowStyle
  };
};
exports.parseColor = parseColor;