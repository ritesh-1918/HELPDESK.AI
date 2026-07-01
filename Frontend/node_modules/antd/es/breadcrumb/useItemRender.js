"use client";

import * as React from 'react';
import pickAttrs from "@rc-component/util/es/pickAttrs";
import { clsx } from 'clsx';
import isNonNullable from '../_util/isNonNullable';
function getBreadcrumbName(route, params) {
  if (!isNonNullable(route.title)) {
    return null;
  }
  const paramsKeys = Object.keys(params).join('|');
  return typeof route.title === 'object' ? route.title : String(route.title).replace(new RegExp(`:(${paramsKeys})`, 'g'), (replacement, key) => params[key] || replacement);
}
export function renderItem(prefixCls, item, children, href) {
  if (!isNonNullable(children)) {
    return null;
  }
  const {
    className,
    onClick,
    ...restItem
  } = item;
  const passedProps = {
    ...pickAttrs(restItem, {
      data: true,
      aria: true
    }),
    onClick
  };
  if (href !== undefined) {
    return /*#__PURE__*/React.createElement("a", {
      ...passedProps,
      className: clsx(`${prefixCls}-link`, className),
      href: href
    }, children);
  }
  return /*#__PURE__*/React.createElement("span", {
    ...passedProps,
    className: clsx(`${prefixCls}-link`, className)
  }, children);
}
export default function useItemRender(prefixCls, itemRender) {
  const mergedItemRender = (item, params, routes, path, href) => {
    if (itemRender) {
      return itemRender(item, params, routes, path);
    }
    const name = getBreadcrumbName(item, params);
    return renderItem(prefixCls, item, name, href);
  };
  return mergedItemRender;
}