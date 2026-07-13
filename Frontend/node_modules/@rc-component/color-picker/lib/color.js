"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRoundNumber = exports.Color = void 0;
var _fastColor = require("@ant-design/fast-color");
const getRoundNumber = value => Math.round(Number(value || 0));
exports.getRoundNumber = getRoundNumber;
const convertHsb2Hsv = color => {
  if (color instanceof _fastColor.FastColor) {
    return color;
  }
  if (color && typeof color === 'object' && 'h' in color && 'b' in color) {
    const {
      b,
      ...resets
    } = color;
    return {
      ...resets,
      v: b
    };
  }
  if (typeof color === 'string' && /hsb/.test(color)) {
    return color.replace(/hsb/, 'hsv');
  }
  return color;
};
class Color extends _fastColor.FastColor {
  constructor(color) {
    super(convertHsb2Hsv(color));
  }
  toHsbString() {
    const hsb = this.toHsb();
    const saturation = getRoundNumber(hsb.s * 100);
    const lightness = getRoundNumber(hsb.b * 100);
    const hue = getRoundNumber(hsb.h);
    const alpha = hsb.a;
    const hsbString = `hsb(${hue}, ${saturation}%, ${lightness}%)`;
    const hsbaString = `hsba(${hue}, ${saturation}%, ${lightness}%, ${alpha.toFixed(alpha === 0 ? 0 : 2)})`;
    return alpha === 1 ? hsbString : hsbaString;
  }
  toHsb() {
    const {
      v,
      ...resets
    } = this.toHsv();
    return {
      ...resets,
      b: v,
      a: this.a
    };
  }
}
exports.Color = Color;