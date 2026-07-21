"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateColor = exports.defaultColor = exports.calculateColor = exports.calcOffset = exports.ColorPickerPrefixCls = void 0;
var _color = require("./color");
const ColorPickerPrefixCls = exports.ColorPickerPrefixCls = 'rc-color-picker';
const generateColor = color => {
  if (color instanceof _color.Color) {
    return color;
  }
  return new _color.Color(color);
};
exports.generateColor = generateColor;
const defaultColor = exports.defaultColor = generateColor('#1677ff');
const calculateColor = props => {
  const {
    offset,
    targetRef,
    containerRef,
    color,
    type
  } = props;
  const {
    width,
    height
  } = containerRef.current.getBoundingClientRect();
  const {
    width: targetWidth,
    height: targetHeight
  } = targetRef.current.getBoundingClientRect();
  const centerOffsetX = targetWidth / 2;
  const centerOffsetY = targetHeight / 2;
  const saturation = (offset.x + centerOffsetX) / width;
  const bright = 1 - (offset.y + centerOffsetY) / height;
  const hsb = color.toHsb();
  const alphaOffset = saturation;
  const hueOffset = (offset.x + centerOffsetX) / width * 360;
  if (type) {
    switch (type) {
      case 'hue':
        return generateColor({
          ...hsb,
          h: hueOffset <= 0 ? 0 : hueOffset
        });
      case 'alpha':
        return generateColor({
          ...hsb,
          a: alphaOffset <= 0 ? 0 : alphaOffset
        });
    }
  }
  return generateColor({
    h: hsb.h,
    s: saturation <= 0 ? 0 : saturation,
    b: bright >= 1 ? 1 : bright,
    a: hsb.a
  });
};
exports.calculateColor = calculateColor;
const calcOffset = (color, type) => {
  const hsb = color.toHsb();
  switch (type) {
    case 'hue':
      return {
        x: hsb.h / 360 * 100,
        y: 50
      };
    case 'alpha':
      return {
        x: color.a * 100,
        y: 50
      };

    // Picker panel
    default:
      return {
        x: hsb.s * 100,
        y: (1 - hsb.b) * 100
      };
  }
};
exports.calcOffset = calcOffset;