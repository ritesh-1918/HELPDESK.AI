"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBright = exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _colorPicker = require("@rc-component/color-picker");
var _clsx = require("clsx");
var _collapse = _interopRequireDefault(require("../../collapse"));
var _locale = require("../../locale");
var _internal = require("../../theme/internal");
var _util = require("../util");
const genPresetColor = list => list.map(value => {
  value.colors = value.colors.map(_util.generateColor);
  return value;
});
const isBright = (value, bgColorToken) => {
  const {
    r,
    g,
    b,
    a
  } = value.toRgb();
  const hsv = new _colorPicker.Color(value.toRgbString()).onBackground(bgColorToken).toHsv();
  if (a <= 0.5) {
    // Adapted to dark mode
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
};
exports.isBright = isBright;
const genCollapsePanelKey = (preset, index) => {
  const mergedKey = preset.key ?? index;
  return `panel-${mergedKey}`;
};
const ColorPresets = ({
  prefixCls,
  presets,
  value: color,
  onChange
}) => {
  const [locale] = (0, _locale.useLocale)('ColorPicker');
  const [, token] = (0, _internal.useToken)();
  const presetsValue = (0, _react.useMemo)(() => genPresetColor(presets), [presets]);
  const colorPresetsPrefixCls = `${prefixCls}-presets`;
  const activeKeys = (0, _react.useMemo)(() => presetsValue.reduce((acc, preset, index) => {
    const {
      defaultOpen = true
    } = preset;
    if (defaultOpen) {
      acc.push(genCollapsePanelKey(preset, index));
    }
    return acc;
  }, []), [presetsValue]);
  const handleClick = colorValue => {
    onChange?.(colorValue);
  };
  const items = presetsValue.map((preset, index) => ({
    key: genCollapsePanelKey(preset, index),
    label: /*#__PURE__*/_react.default.createElement("div", {
      className: `${colorPresetsPrefixCls}-label`
    }, preset?.label),
    children: (/*#__PURE__*/_react.default.createElement("div", {
      className: `${colorPresetsPrefixCls}-items`
    }, Array.isArray(preset?.colors) && preset.colors?.length > 0 ? preset.colors.map((presetColor, index) => {
      const colorInst = (0, _util.generateColor)(presetColor);
      return /*#__PURE__*/_react.default.createElement(_colorPicker.ColorBlock
      // eslint-disable-next-line react/no-array-index-key
      , {
        // eslint-disable-next-line react/no-array-index-key
        key: `preset-${index}-${presetColor.toHexString()}`,
        color: colorInst.toCssString(),
        prefixCls: prefixCls,
        className: (0, _clsx.clsx)(`${colorPresetsPrefixCls}-color`, {
          [`${colorPresetsPrefixCls}-color-checked`]: presetColor.toCssString() === color?.toCssString(),
          [`${colorPresetsPrefixCls}-color-bright`]: isBright(presetColor, token.colorBgElevated)
        }),
        onClick: () => handleClick(presetColor)
      });
    }) : (/*#__PURE__*/_react.default.createElement("span", {
      className: `${colorPresetsPrefixCls}-empty`
    }, locale.presetEmpty))))
  }));
  return /*#__PURE__*/_react.default.createElement("div", {
    className: colorPresetsPrefixCls
  }, /*#__PURE__*/_react.default.createElement(_collapse.default, {
    defaultActiveKey: activeKeys,
    ghost: true,
    items: items
  }));
};
var _default = exports.default = ColorPresets;