"use client";

import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import React from 'react';
import { clsx } from 'clsx';
import isNonNullable from '../_util/isNonNullable';
import { cloneElement, isFragment } from '../_util/reactNode';
import { PresetColors } from '../theme/interface';
const rxTwoCNChar = /^[\u4E00-\u9FA5]{2}$/;
export const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
export function convertLegacyProps(type) {
  if (type === 'danger') {
    return {
      danger: true
    };
  }
  return {
    type
  };
}
export function isString(str) {
  return typeof str === 'string';
}
export function isUnBorderedButtonVariant(type) {
  return type === 'text' || type === 'link';
}
function splitCNCharsBySpace(child, needInserted, style, className) {
  if (!isNonNullable(child) || child === '') {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  if (typeof child !== 'string' && typeof child !== 'number' && isString(child.type) && isTwoCNChar(child.props.children)) {
    return cloneElement(child, oriProps => {
      const mergedCls = clsx(oriProps.className, className) || undefined;
      const mergedStyle = {
        ...style,
        ...oriProps.style
      };
      return {
        ...oriProps,
        children: oriProps.children.split('').join(SPACE),
        className: mergedCls,
        style: mergedStyle
      };
    });
  }
  if (isString(child)) {
    return /*#__PURE__*/React.createElement("span", {
      className: className,
      style: style
    }, isTwoCNChar(child) ? child.split('').join(SPACE) : child);
  }
  if (isFragment(child)) {
    return /*#__PURE__*/React.createElement("span", {
      className: className,
      style: style
    }, child);
  }
  return cloneElement(child, oriProps => ({
    ...oriProps,
    className: clsx(oriProps.className, className) || undefined,
    style: {
      ...oriProps.style,
      ...style
    }
  }));
}
export function spaceChildren(children, needInserted, style, className) {
  let isPrevChildPure = false;
  const childList = [];
  React.Children.forEach(children, child => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }
    isPrevChildPure = isCurrentChildPure;
  });
  return React.Children.map(childList, child => splitCNCharsBySpace(child, needInserted, style, className));
}
const _ButtonTypes = ['default', 'primary', 'dashed', 'link', 'text'];
const _ButtonShapes = ['default', 'circle', 'round', 'square'];
const _ButtonHTMLTypes = ['submit', 'button', 'reset'];
export const _ButtonVariantTypes = ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'];
export const _ButtonColorTypes = ['default', 'primary', 'danger'].concat(_toConsumableArray(PresetColors));