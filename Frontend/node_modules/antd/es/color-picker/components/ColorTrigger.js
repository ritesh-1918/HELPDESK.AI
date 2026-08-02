"use client";

import React, { forwardRef, useMemo } from 'react';
import { ColorBlock } from '@rc-component/color-picker';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import { useLocale } from '../../locale';
import { getColorAlpha } from '../util';
import ColorClear from './ColorClear';
const ColorTrigger = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    color,
    prefixCls,
    open,
    disabled,
    format,
    className,
    style,
    classNames,
    styles,
    showText,
    activeIndex,
    ...rest
  } = props;
  const colorTriggerPrefixCls = `${prefixCls}-trigger`;
  const colorTextPrefixCls = `${colorTriggerPrefixCls}-text`;
  const colorTextCellPrefixCls = `${colorTextPrefixCls}-cell`;
  const [locale] = useLocale('ColorPicker');
  // ============================== Text ==============================
  const desc = React.useMemo(() => {
    if (!showText) {
      return '';
    }
    if (typeof showText === 'function') {
      return showText(color);
    }
    if (color.cleared) {
      return locale.transparent;
    }
    if (color.isGradient()) {
      return color.getColors().map((c, index) => {
        const inactive = activeIndex !== -1 && activeIndex !== index;
        return /*#__PURE__*/React.createElement("span", {
          key: index,
          className: clsx(colorTextCellPrefixCls, inactive && `${colorTextCellPrefixCls}-inactive`)
        }, c.color.toRgbString(), " ", c.percent, "%");
      });
    }
    const hexString = color.toHexString().toUpperCase();
    const alpha = getColorAlpha(color);
    switch (format) {
      case 'rgb':
        return color.toRgbString();
      case 'hsb':
        return color.toHsbString();
      // case 'hex':
      default:
        return alpha < 100 ? `${hexString.slice(0, 7)},${alpha}%` : hexString;
    }
  }, [color, format, showText, activeIndex, locale.transparent, colorTextCellPrefixCls]);
  // ============================= Render =============================
  const containerNode = useMemo(() => color.cleared ? (/*#__PURE__*/React.createElement(ColorClear, {
    prefixCls: prefixCls,
    className: classNames.body,
    style: styles.body
  })) : (/*#__PURE__*/React.createElement(ColorBlock, {
    prefixCls: prefixCls,
    color: color.toCssString(),
    className: classNames.body,
    innerClassName: classNames.content,
    style: styles.body,
    innerStyle: styles.content
  })), [color, prefixCls, classNames.body, classNames.content, styles.body, styles.content]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: clsx(colorTriggerPrefixCls, className, classNames.root, {
      [`${colorTriggerPrefixCls}-active`]: open,
      [`${colorTriggerPrefixCls}-disabled`]: disabled
    }),
    style: {
      ...styles.root,
      ...style
    },
    ...pickAttrs(rest)
  }, containerNode, showText && (/*#__PURE__*/React.createElement("div", {
    className: clsx(colorTextPrefixCls, classNames.description),
    style: styles.description
  }, desc)));
});
export default ColorTrigger;