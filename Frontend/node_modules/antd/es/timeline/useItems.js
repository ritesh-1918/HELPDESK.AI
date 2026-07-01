"use client";

import * as React from 'react';
import LoadingOutlined from "@ant-design/icons/es/icons/LoadingOutlined";
import { toArray } from '@rc-component/util';
import { clsx } from 'clsx';
import { genCssVar } from '../theme/util/genStyleUtils';
const useItems = (rootPrefixCls, prefixCls, mode, items, children, pending, pendingDot) => {
  const itemCls = `${prefixCls}-item`;
  const [varName] = genCssVar(rootPrefixCls, 'cmp-steps');
  // Merge items and children
  const parseItems = React.useMemo(() => {
    return Array.isArray(items) ? items : toArray(children).map(ele => ({
      ...ele.props
    }));
  }, [items, children]);
  // convert legacy type
  return React.useMemo(() => {
    const mergedItems = parseItems.map((item, index) => {
      const {
        label,
        children,
        title,
        content,
        color,
        className,
        style,
        icon,
        dot,
        placement,
        position,
        loading,
        ...restProps
      } = item;
      let mergedStyle = style;
      let mergedClassName = className;
      if (color) {
        if (['blue', 'red', 'green', 'gray'].includes(color)) {
          mergedClassName = clsx(className, `${itemCls}-color-${color}`);
        } else {
          mergedStyle = {
            [varName('item-icon-dot-color')]: color,
            ...style
          };
        }
      }
      // Placement
      const mergedPlacement = placement ?? position ?? (mode === 'alternate' ? index % 2 === 0 ? 'start' : 'end' : mode);
      mergedClassName = clsx(mergedClassName, `${itemCls}-placement-${mergedPlacement}`);
      // Icon
      let mergedIcon = icon ?? dot;
      if (!mergedIcon && loading) {
        mergedIcon = /*#__PURE__*/React.createElement(LoadingOutlined, null);
      }
      return {
        ...restProps,
        title: title ?? label,
        content: content ?? children,
        style: mergedStyle,
        className: mergedClassName,
        icon: mergedIcon,
        status: loading ? 'process' : 'finish'
      };
    });
    if (pending) {
      mergedItems.push({
        icon: pendingDot ?? /*#__PURE__*/React.createElement(LoadingOutlined, null),
        content: pending,
        status: 'process'
      });
    }
    return mergedItems;
  }, [parseItems, pending, mode, itemCls, varName, pendingDot]);
};
export default useItems;