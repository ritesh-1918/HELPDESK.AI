"use client";

import React, { useMemo } from 'react';
import { ColorBlock, Color as RcColor } from '@rc-component/color-picker';
import { clsx } from 'clsx';
import Collapse from '../../collapse';
import { useLocale } from '../../locale';
import { useToken } from '../../theme/internal';
import { generateColor } from '../util';
const genPresetColor = list => list.map(value => {
  value.colors = value.colors.map(generateColor);
  return value;
});
export const isBright = (value, bgColorToken) => {
  const {
    r,
    g,
    b,
    a
  } = value.toRgb();
  const hsv = new RcColor(value.toRgbString()).onBackground(bgColorToken).toHsv();
  if (a <= 0.5) {
    // Adapted to dark mode
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
};
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
  const [locale] = useLocale('ColorPicker');
  const [, token] = useToken();
  const presetsValue = useMemo(() => genPresetColor(presets), [presets]);
  const colorPresetsPrefixCls = `${prefixCls}-presets`;
  const activeKeys = useMemo(() => presetsValue.reduce((acc, preset, index) => {
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
    label: /*#__PURE__*/React.createElement("div", {
      className: `${colorPresetsPrefixCls}-label`
    }, preset?.label),
    children: (/*#__PURE__*/React.createElement("div", {
      className: `${colorPresetsPrefixCls}-items`
    }, Array.isArray(preset?.colors) && preset.colors?.length > 0 ? preset.colors.map((presetColor, index) => {
      const colorInst = generateColor(presetColor);
      return /*#__PURE__*/React.createElement(ColorBlock
      // eslint-disable-next-line react/no-array-index-key
      , {
        // eslint-disable-next-line react/no-array-index-key
        key: `preset-${index}-${presetColor.toHexString()}`,
        color: colorInst.toCssString(),
        prefixCls: prefixCls,
        className: clsx(`${colorPresetsPrefixCls}-color`, {
          [`${colorPresetsPrefixCls}-color-checked`]: presetColor.toCssString() === color?.toCssString(),
          [`${colorPresetsPrefixCls}-color-bright`]: isBright(presetColor, token.colorBgElevated)
        }),
        onClick: () => handleClick(presetColor)
      });
    }) : (/*#__PURE__*/React.createElement("span", {
      className: `${colorPresetsPrefixCls}-empty`
    }, locale.presetEmpty))))
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: colorPresetsPrefixCls
  }, /*#__PURE__*/React.createElement(Collapse, {
    defaultActiveKey: activeKeys,
    ghost: true,
    items: items
  }));
};
export default ColorPresets;