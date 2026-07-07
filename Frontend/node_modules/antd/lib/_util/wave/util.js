"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTargetWaveColor = getTargetWaveColor;
exports.isValidWaveColor = isValidWaveColor;
function isValidWaveColor(color) {
  return color && typeof color === 'string' && color !== '#fff' && color !== '#ffffff' && color !== 'rgb(255, 255, 255)' && color !== 'rgba(255, 255, 255, 1)' && !/rgba\((?:\d*, ){3}0\)/.test(color) &&
  // any transparent rgba color
  color !== 'transparent' && color !== 'canvastext';
}
function getTargetWaveColor(node, colorSource = null) {
  const style = getComputedStyle(node);
  const {
    borderTopColor,
    borderColor,
    backgroundColor
  } = style;
  if (colorSource && isValidWaveColor(style[colorSource])) {
    return style[colorSource];
  }
  return [borderTopColor, borderColor, backgroundColor].find(isValidWaveColor) ?? null;
}