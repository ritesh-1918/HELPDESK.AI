"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _colors = require("@ant-design/colors");
var _presetColors = require("../../interface/presetColors");
var _default2 = _interopRequireDefault(require("../default"));
var _seed = require("../seed");
var _genColorMapToken = _interopRequireDefault(require("../shared/genColorMapToken"));
var _colors2 = require("./colors");
const derivative = (token, mapToken) => {
  const colorPalettes = Object.keys(_seed.defaultPresetColors).map(colorKey => {
    const colors = (0, _colors.generate)(token[colorKey], {
      theme: 'dark'
    });
    return Array.from({
      length: 10
    }, () => 1).reduce((prev, _, i) => {
      prev[`${colorKey}-${i + 1}`] = colors[i];
      prev[`${colorKey}${i + 1}`] = colors[i];
      return prev;
    }, {});
  }).reduce((prev, cur) => {
    prev = {
      ...prev,
      ...cur
    };
    return prev;
  }, {});
  const mergedMapToken = mapToken ?? (0, _default2.default)(token);
  const colorMapToken = (0, _genColorMapToken.default)(token, {
    generateColorPalettes: _colors2.generateColorPalettes,
    generateNeutralColorPalettes: _colors2.generateNeutralColorPalettes
  });
  const presetColorHoverActiveTokens = _presetColors.PresetColors.reduce((prev, colorKey) => {
    const colorBase = token[colorKey];
    if (colorBase) {
      const colorPalette = (0, _colors2.generateColorPalettes)(colorBase);
      prev[`${colorKey}Hover`] = colorPalette[7];
      prev[`${colorKey}Active`] = colorPalette[5];
    }
    return prev;
  }, {});
  return {
    ...mergedMapToken,
    // Dark tokens
    ...colorPalettes,
    // Colors
    ...colorMapToken,
    ...presetColorHoverActiveTokens,
    // Customize selected item background color
    // https://github.com/ant-design/ant-design/issues/30524#issuecomment-871961867
    colorPrimaryBg: colorMapToken.colorPrimaryBorder,
    colorPrimaryBgHover: colorMapToken.colorPrimaryBorderHover
  };
};
var _default = exports.default = derivative;